// 공용 Vercel KV(Upstash Redis) 헬퍼 — 누적 집계(SADD/SCARD)용.
// env 미설정 시 모든 함수가 무해하게(no-op / configured:false) 동작한다.

const URL_KEYS = ['KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL', 'REDIS_REST_API_URL', 'STORAGE_REST_API_URL']
const TOKEN_KEYS = ['KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN', 'REDIS_REST_API_TOKEN', 'STORAGE_REST_API_TOKEN']

function pickEnv(keys) {
  for (const k of keys) {
    if (process.env[k]) return process.env[k]
  }
  return ''
}

export function kvConfigured() {
  return !!(pickEnv(URL_KEYS) && pickEnv(TOKEN_KEYS))
}

export async function kvPipeline(commands) {
  const url = pickEnv(URL_KEYS).replace(/\/$/, '')
  const token = pickEnv(TOKEN_KEYS)
  if (!url || !token) return null
  const r = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  })
  if (!r.ok) throw new Error(`kv ${r.status}: ${(await r.text().catch(() => '')).slice(0, 200)}`)
  return (await r.json()).map((x) => x.result)
}

// KST 기준 이번 달 키 "YYYY-MM"
export function kstMonth() {
  const k = new Date(Date.now() + 9 * 3600 * 1000)
  return `${k.getUTCFullYear()}-${String(k.getUTCMonth() + 1).padStart(2, '0')}`
}

// ns 네임스페이스(dash/quiz)에 id들을 전체 집합 + 이번달 집합에 추가(중복 없이 누적).
// 집계 실패는 서비스에 영향 주지 않도록 조용히 무시.
export async function logSeen(ns, ids) {
  try {
    const members = [...new Set((ids || []).filter(Boolean).map(String))]
    if (!members.length || !kvConfigured()) return
    const month = kstMonth()
    await kvPipeline([
      ['SADD', `seen:${ns}:all`, ...members],
      ['SADD', `seen:${ns}:${month}`, ...members],
      ['SADD', `seen:${ns}:months`, month],
    ])
  } catch {
    /* ignore */
  }
}

// ns 의 누적 총수 + 월별 수 조회
export async function readSeen(ns) {
  if (!kvConfigured()) return { configured: false, total: 0, byMonth: {} }
  const [months, total] = await kvPipeline([
    ['SMEMBERS', `seen:${ns}:months`],
    ['SCARD', `seen:${ns}:all`],
  ])
  const ms = (months || []).slice().sort()
  const byMonth = {}
  if (ms.length) {
    const counts = await kvPipeline(ms.map((m) => ['SCARD', `seen:${ns}:${m}`]))
    ms.forEach((m, i) => {
      byMonth[m] = parseInt(counts[i], 10) || 0
    })
  }
  return { configured: true, total: parseInt(total, 10) || 0, byMonth }
}
