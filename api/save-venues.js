// Vercel 서버리스 함수: /api/save-venues (POST)
// 프로덕션 저장 — venuePositions.json 을 GitHub에 커밋한다. (Vercel은 파일시스템 읽기전용이라 직접 못 씀)
// GitHub에 커밋되면 git 연동된 Vercel이 자동 재배포 → 약 1분 뒤 라이브 반영.
// 필요 env: GITHUB_TOKEN(repo 쓰기), GITHUB_REPO("owner/repo"). 선택: GITHUB_BRANCH(기본 main).

const FILE_PATH = 'src/imports/지도/venuePositions.json'

function readBody(req) {
  return new Promise((resolve) => {
    let b = ''
    req.on('data', (c) => (b += c))
    req.on('end', () => resolve(b))
  })
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (req.method !== 'POST') {
    res.statusCode = 405
    return res.end(JSON.stringify({ ok: false, error: 'POST only' }))
  }
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH || 'main'
  if (!token || !repo) {
    res.statusCode = 500
    return res.end(JSON.stringify({ ok: false, error: 'GITHUB_TOKEN/GITHUB_REPO 미설정' }))
  }

  // 본문 파싱 + 검증 (위치 객체만 허용)
  let data
  try {
    data = JSON.parse(await readBody(req))
  } catch {
    res.statusCode = 400
    return res.end(JSON.stringify({ ok: false, error: 'invalid json' }))
  }
  const keys = Object.keys(data || {})
  const okShape =
    keys.length > 0 &&
    keys.length <= 500 &&
    keys.every((k) => data[k] && typeof data[k].x === 'number' && typeof data[k].y === 'number')
  if (!okShape) {
    res.statusCode = 400
    return res.end(JSON.stringify({ ok: false, error: '위치 형식 오류' }))
  }

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${FILE_PATH.split('/')
    .map(encodeURIComponent)
    .join('/')}`
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'daehangno-save-venues',
  }

  try {
    // 현재 파일 SHA (덮어쓰기에 필요)
    let sha
    const cur = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, { headers })
    if (cur.ok) sha = (await cur.json()).sha

    const content = Buffer.from(JSON.stringify(data, null, 2) + '\n', 'utf-8').toString('base64')
    const put = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: 'chore: update venue positions (edit mode)',
        content,
        sha,
        branch,
      }),
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
