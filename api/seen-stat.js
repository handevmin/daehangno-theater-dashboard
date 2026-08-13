// Vercel 서버리스 함수: /api/seen-stat (GET)
//  - 공스피(대시보드)에 소개된 연극 누적 수 + 월별
//  - 극캐감별사에서 추천된 공연 누적 수 + 월별
// 저장소: Vercel KV. 미설정 시 configured:false.
import { readSeen, kvConfigured } from './_kv.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  try {
    const [dashboard, quiz] = await Promise.all([readSeen('dash'), readSeen('quiz')])
    res.statusCode = 200
    res.end(JSON.stringify({ configured: kvConfigured(), dashboard, quiz }))
  } catch (e) {
    res.statusCode = 502
    res.end(JSON.stringify({ configured: kvConfigured(), error: String(e?.message || e) }))
  }
}
