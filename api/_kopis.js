// 공유 KOPIS 프록시 코어 — Vercel 서버리스 함수와 Vite 개발 미들웨어가 함께 사용한다.
// KOPIS OpenAPI는 (1) CORS 미지원, (2) HTTPS 미지원(301 리다이렉트), (3) XML 응답,
// (4) 서비스키 노출 위험이 있어 브라우저에서 직접 호출할 수 없다. 이 프록시가 그 4가지를 해결한다.
import { XMLParser } from 'fast-xml-parser'

const KOPIS_BASE = 'http://www.kopis.or.kr/openApi/restful'
const KOPIS_HOST = 'www.kopis.or.kr'

// 항상 배열로 다뤄야 하는 반복 노드 (단건일 때 XML 파서가 객체로 주는 것을 방지)
const ALWAYS_ARRAY = new Set([
  'boxofs.boxof',
  'box-statsofs.boxStatsof',
  'prfsts.prfst',
  'dbs.db',
  'styurls.styurl',
  'relates.relate',
])

const parser = new XMLParser({
  ignoreAttributes: true,
  trimValues: true,
  isArray: (name, jpath) => ALWAYS_ARRAY.has(jpath),
})

function serviceKey() {
  const key = process.env.KOPIS_SERVICE_KEY
  if (!key) throw new Error('KOPIS_SERVICE_KEY 환경변수가 설정되지 않았습니다 (.env 확인).')
  return key
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// endpoint 예: "boxoffice", "pblprfr/PF290257", "boxStats"
// KOPIS는 호출량이 많으면 간헐적으로 실패/빈응답을 주므로 재시도한다 (집계 0 왜곡 방지).
export async function fetchKopisJson(endpoint, params = {}, retries = 3) {
  const url = new URL(`${KOPIS_BASE}/${endpoint}`)
  url.searchParams.set('service', serviceKey())
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
  }
  let lastErr
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url.toString(), { headers: { Accept: 'application/xml' } })
      if (!res.ok) throw new Error(`KOPIS ${endpoint} 응답 오류 ${res.status}`)
      const xml = await res.text()
      const json = parser.parse(xml)
      // KOPIS 오류 응답: <dbs><db><returncode>01</returncode><errmsg>...</errmsg></db></dbs>
      const errmsg = json?.dbs?.db?.errmsg ?? json?.dbs?.db?.[0]?.errmsg
      if (errmsg) throw new Error(`KOPIS 오류: ${errmsg}`)
      return json
    } catch (err) {
      lastErr = err
      if (attempt < retries - 1) await sleep(250 * (attempt + 1))
    }
  }
  throw lastErr
}

// 쿼리스트링에서 endpoint를 분리하고 나머지를 KOPIS 파라미터로 전달
export async function handleKopis(req, res) {
  try {
    const u = new URL(req.url, 'http://localhost')
    const endpoint = u.searchParams.get('endpoint')
    if (!endpoint || !/^[a-zA-Z]+(\/[A-Za-z0-9]+)?$/.test(endpoint)) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ error: 'invalid endpoint' }))
      return
    }
    const params = {}
    for (const [k, v] of u.searchParams.entries()) {
      if (k !== 'endpoint') params[k] = v
    }
    const json = await fetchKopisJson(endpoint, params)
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    // KOPIS 데이터는 자주 안 바뀌므로 10분 캐시 + stale-while-revalidate
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600')
    res.end(JSON.stringify(json))
  } catch (err) {
    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: String(err?.message || err) }))
  }
}

// 포스터/소개이미지 프록시 — KOPIS는 HTTPS를 안 주므로 이미지도 우리 오리진(HTTPS)으로 중계한다.
export async function handleKopisImage(req, res) {
  try {
    const u = new URL(req.url, 'http://localhost')
    const raw = u.searchParams.get('url')
    if (!raw) {
      res.statusCode = 400
      res.end('missing url')
      return
    }
    const target = new URL(raw)
    // 보안: kopis.or.kr 호스트만 허용 (오픈 프록시 방지)
    if (target.hostname !== KOPIS_HOST) {
      res.statusCode = 403
      res.end('forbidden host')
      return
    }
    const upstream = await fetch(target.toString())
    if (!upstream.ok) {
      res.statusCode = upstream.status
      res.end('upstream error')
      return
    }
    const buf = Buffer.from(await upstream.arrayBuffer())
    res.statusCode = 200
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'image/jpeg')
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400')
    res.end(buf)
  } catch (err) {
    res.statusCode = 502
    res.end('image proxy error')
  }
}
