// Vercel 서버리스 함수: /api/save-curation (POST)
// 추천 페이지(서울연극센터 / AI) 콘텐츠를 GitHub에 커밋한다. 커밋 → Vercel 자동 재배포 → 약 1분 뒤 반영.
// 필요 env: GITHUB_TOKEN, GITHUB_REPO("owner/repo"). 선택: GITHUB_BRANCH(기본 main), EDIT_KEY(편집 키 보호).

const FILE_PATH = 'src/app/data/curation.json'

function readBody(req) {
  return new Promise((resolve) => {
    let b = ''
    req.on('data', (c) => (b += c))
    req.on('end', () => resolve(b))
  })
}

function validCuration(c) {
  if (!c || typeof c !== 'object') return false
  return ['seoul', 'ai'].every((k) => {
    const v = c[k]
    return (
      v &&
      typeof v.hashtag === 'string' &&
      typeof v.moodTitle === 'string' &&
      typeof v.moodDesc === 'string' &&
      typeof v.vibe === 'string' &&
      Array.isArray(v.tags) &&
      Array.isArray(v.plays) &&
      v.plays.length <= 20 &&
      v.plays.every((p) => p && typeof p.title === 'string')
    )
  })
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
      return res.end(JSON.stringify({ ok: false, error: '편집 키 필요 (?admin=1&key=…)' }))
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
  if (!validCuration(data)) {
    res.statusCode = 400
    return res.end(JSON.stringify({ ok: false, error: '콘텐츠 형식 오류' }))
  }

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${FILE_PATH.split('/')
    .map(encodeURIComponent)
    .join('/')}`
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'daehangno-save-curation',
  }
  try {
    let sha
    const cur = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, { headers })
    if (cur.ok) sha = (await cur.json()).sha
    const content = Buffer.from(JSON.stringify(data, null, 2) + '\n', 'utf-8').toString('base64')
    const put = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ message: 'chore: update curation content (admin)', content, sha, branch }),
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
