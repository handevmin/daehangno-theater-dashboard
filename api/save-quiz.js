// Vercel 서버리스 함수: /api/save-quiz (POST)
// 극캐감별사 설문/결과 텍스트(quizContent.json)를 GitHub에 커밋한다. 커밋 → 자동 재배포 → 약 1분 뒤 반영.
// 필요 env: GITHUB_TOKEN, GITHUB_REPO("owner/repo"). 선택: GITHUB_BRANCH(기본 main), EDIT_KEY(편집 키 보호).

const FILE_PATH = 'src/app/data/quizContent.json'
const CHAR_KEYS = ['hamlet', 'macbeth', 'romeo', 'oedipus', 'nora', 'antigone', 'falstaff', 'faust']

function readBody(req) {
  return new Promise((resolve) => {
    let b = ''
    req.on('data', (c) => (b += c))
    req.on('end', () => resolve(b))
  })
}

// 구조 검증 — 텍스트만 편집하므로 캐릭터 키/구조는 그대로여야 한다.
function validQuiz(c) {
  if (!c || typeof c !== 'object') return false
  if (!c.meta || typeof c.meta.title !== 'string') return false
  if (!Array.isArray(c.questions) || c.questions.length === 0 || c.questions.length > 40) return false
  const qOk = c.questions.every(
    (q) =>
      q &&
      typeof q.q === 'string' &&
      Array.isArray(q.options) &&
      q.options.length > 0 &&
      q.options.every((o) => o && typeof o.text === 'string' && CHAR_KEYS.includes(o.char)),
  )
  if (!qOk) return false
  if (!c.results || typeof c.results !== 'object') return false
  const rOk = CHAR_KEYS.every((k) => {
    const r = c.results[k]
    return (
      r &&
      typeof r.name === 'string' &&
      typeof r.topTitle === 'string' &&
      Array.isArray(r.quote) &&
      typeof r.source === 'string' &&
      Array.isArray(r.description) &&
      r.chemGood && typeof r.chemGood.label === 'string' && CHAR_KEYS.includes(r.chemGood.char) &&
      r.chemBad && typeof r.chemBad.label === 'string' && CHAR_KEYS.includes(r.chemBad.char)
    )
  })
  if (!rOk) return false
  if (!Array.isArray(c.gallery) || c.gallery.length !== CHAR_KEYS.length) return false
  return c.gallery.every((g) => g && CHAR_KEYS.includes(g.key) && typeof g.title === 'string')
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (req.method !== 'POST') {
    res.statusCode = 405
    return res.end(JSON.stringify({ ok: false, error: 'POST only' }))
  }
  const editKey = process.env.EDIT_KEY
  if (editKey) {
    let key = ''
    try {
      key = new URL(req.url, 'http://x').searchParams.get('key') || ''
    } catch {
      key = ''
    }
    if (key !== editKey) {
      res.statusCode = 401
      return res.end(JSON.stringify({ ok: false, error: '편집 키 필요' }))
    }
  }
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH || 'main'
  if (!token || !repo) {
    res.statusCode = 500
    return res.end(JSON.stringify({ ok: false, error: 'GITHUB_TOKEN/GITHUB_REPO 미설정' }))
  }

  let data
  try {
    data = JSON.parse(await readBody(req))
  } catch {
    res.statusCode = 400
    return res.end(JSON.stringify({ ok: false, error: 'invalid json' }))
  }
  if (!validQuiz(data)) {
    res.statusCode = 400
    return res.end(JSON.stringify({ ok: false, error: '설문 형식 오류(문항/결과/갤러리 구조 확인)' }))
  }

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${FILE_PATH.split('/')
    .map(encodeURIComponent)
    .join('/')}`
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'daehangno-save-quiz',
  }
  try {
    let sha
    const cur = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, { headers })
    if (cur.ok) sha = (await cur.json()).sha
    const content = Buffer.from(JSON.stringify(data, null, 2) + '\n', 'utf-8').toString('base64')
    const put = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ message: 'chore: update 극캐감별사 quiz content (admin)', content, sha, branch }),
    })
    if (!put.ok) {
      const t = await put.text()
      res.statusCode = 502
      return res.end(JSON.stringify({ ok: false, error: `github ${put.status}: ${t.slice(0, 300)}` }))
    }
    res.statusCode = 200
    return res.end(JSON.stringify({ ok: true, committed: true, note: 'GitHub 커밋됨 → 약 1분 뒤 자동 재배포' }))
  } catch (e) {
    res.statusCode = 502
    return res.end(JSON.stringify({ ok: false, error: String(e?.message || e) }))
  }
}
