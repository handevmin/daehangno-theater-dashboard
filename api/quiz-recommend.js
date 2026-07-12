// Vercel 서버리스 함수: /api/quiz-recommend
// → 매일 GPT가 대학로 연극 라인업에서 극캐감별사 캐릭터별로 어울리는 연극을 배정(하루 고정)
import { handleQuizRecommend } from './_quiz-recommend.js'

// GPT 호출이 있으므로 실행 시간 여유 (Vercel 플랜이 허용하는 범위에서)
export const config = { maxDuration: 60 }

export default function handler(req, res) {
  return handleQuizRecommend(req, res)
}
