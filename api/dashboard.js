// Vercel 서버리스 함수: /api/dashboard → 대학로 연극 대시보드 전체 페이로드
import { handleDashboard } from './_dashboard.js'

export default function handler(req, res) {
  return handleDashboard(req, res)
}
