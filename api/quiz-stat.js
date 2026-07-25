// Vercel 서버리스 함수: /api/quiz-stat
//  - POST { result: <charKey> }  → 참여 1건 집계 (총계 + 캐릭터별)
//  - GET                          → { configured, total, byChar }
// 저장소: Vercel KV(Upstash Redis) REST API. 미설정 시 configured:false 로 무해하게 동작.
// 필요 env(둘 중 하나): KV_REST_API_URL/KV_REST_API_TOKEN 또는 UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN

const CHAR_KEYS = ['hamlet', 'macbeth', 'romeo', 'oedipus', 'nora', 'antigone', 'falstaff', 'faust']
const TOTAL_KEY = 'quiz:total'
const BYCHAR_KEY = 'quiz:byChar'

// Vercel KV / Upstash / 유사 통합이 주입하는 REST 환경변수 후보 (앞에서부터 우선)
const URL_KEYS = ['KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL', 'REDIS_REST_API_URL', 'STORAGE_REST_API_URL']
const TOKEN_KEYS = ['KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN', 'REDIS_REST_API_TOKEN', 'STORAGE_REST_API_TOKEN']

function pick(keys) {
  for (const k of keys) {
    const v = process.env[k]
    if (v) return { key: k, val: v }
  }
  return { key: '', val: '' }
}
function kvEnv() {
  const u = pick(URL_KEYS)
  const t = pick(TOKEN_KEYS)
  return { url: (u.val || '').replace(/\/$/, ''), token: t.val || '', urlKey: u.key, tokenKey: t.key }
}
// 진단용: REST URL/TOKEN 처럼 보이는 환경변수 이름만 수집(값은 노출 안 함)
function envSeen() {
  return Object.keys(process.env)
    .filter((k) => /(REST_API_(URL|TOKEN))$/.test(k) || /^(KV_|UPSTASH_|REDIS_)/.test(k))
    .sort()
}

// Upstash REST 파이프라인 호출 → 각 명령의 result 배열 반환
async function kvPipeline(commands) {
  const { url, token } = kvEnv()
  if (!url || !token) return null
  const r = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  })
  if (!r.ok) throw new Error(`kv ${r.status}: ${(await r.text().catch(() => '')).slice(0, 200)}`)
  const arr = await r.json() // [{result:...}, ...]
  return arr.map((x) => x.result)
}

function readBody(req) {
  return new Promise((resolve) => {
    let b = ''
    req.on('data', (c) => (b += c))
    req.on('end', () => resolve(b))
  })
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  const { url, token } = kvEnv()
  const configured = !!(url && token)

  try {
    if (req.method === 'POST') {
      let body = {}
      try {
        body = JSON.parse(await readBody(req))
      } catch {
        /* 무시 */
      }
      const result = String(body?.result || '')
      if (!CHAR_KEYS.includes(result)) {
        res.statusCode = 400
        return res.end(JSON.stringify({ ok: false, error: 'invalid result' }))
      }
      if (!configured) {
        // 저장소 미설정 — 조용히 성공 처리(집계는 안 됨)
        res.statusCode = 200
        return res.end(JSON.stringify({ ok: true, configured: false }))
      }
      await kvPipeline([
        ['INCR', TOTAL_KEY],
        ['HINCRBY', BYCHAR_KEY, result, '1'],
      ])
      res.statusCode = 200
      return res.end(JSON.stringify({ ok: true, configured: true }))
    }

    // GET — 집계 조회
    if (!configured) {
      res.statusCode = 200
      // 미설정 시: 감지된 관련 환경변수 이름을 함께 반환(진단용, 값 노출 안 함)
      return res.end(JSON.stringify({ configured: false, total: 0, byChar: {}, envSeen: envSeen() }))
    }
    const [total, hash] = await kvPipeline([
      ['GET', TOTAL_KEY],
      ['HGETALL', BYCHAR_KEY],
    ])
    // HGETALL → [field, val, field, val, ...]
    const byChar = {}
    for (const k of CHAR_KEYS) byChar[k] = 0
    if (Array.isArray(hash)) {
      for (let i = 0; i < hash.length; i += 2) {
        const f = hash[i]
        const v = parseInt(hash[i + 1], 10) || 0
        if (CHAR_KEYS.includes(f)) byChar[f] = v
      }
    }
    res.statusCode = 200
    res.setHeader('Cache-Control', 'no-store')
    return res.end(JSON.stringify({ configured: true, total: parseInt(total, 10) || 0, byChar }))
  } catch (e) {
    res.statusCode = 502
    return res.end(JSON.stringify({ ok: false, configured, error: String(e?.message || e) }))
  }
}
