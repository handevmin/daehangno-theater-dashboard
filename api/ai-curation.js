// Vercel 서버리스 함수: /api/ai-curation → GPT가 오늘의 의미·절기·날씨로 추천하는 대학로 연극(CurationContent)
import { handleAiCuration } from './_ai-curation.js'

export default function handler(req, res) {
  return handleAiCuration(req, res)
}
