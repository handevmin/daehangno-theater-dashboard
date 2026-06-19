// Vercel 서버리스 함수: /api/kopis?endpoint=boxoffice&stdate=...&...
import { handleKopis } from './_kopis.js'

export default function handler(req, res) {
  return handleKopis(req, res)
}
