// Vercel 서버리스 함수: /api/dashboard → 대학로 연극 대시보드 전체 페이로드
import { handleDashboard } from './_dashboard.js'

// 콜드 빌드 시 KOPIS 상세조회가 많아 시간이 걸릴 수 있어 여유를 둔다.
export const config = { maxDuration: 30 }

export default function handler(req, res) {
  return handleDashboard(req, res)
}
