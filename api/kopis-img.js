// Vercel 서버리스 함수: /api/kopis-img?url=<kopis 이미지 URL>
import { handleKopisImage } from './_kopis.js'

export default function handler(req, res) {
  return handleKopisImage(req, res)
}
