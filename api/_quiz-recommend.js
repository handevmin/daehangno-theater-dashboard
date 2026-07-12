// 극캐감별사 캐릭터별 연극 추천 — 매일 1회 GPT가 현재 대학로 연극 라인업에서
// 8개 캐릭터 유형 각각에 어울리는 연극을 배정하고, 그 날 하루 동안 고정한다.
// (날짜 키 메모리 캐시 + CDN 캐시로 OpenAI 호출을 하루 1~2회로 억제)
import { getDaehakroPool, fmt, addDays } from './_dashboard.js'

// 8개 캐릭터 유형과 성향 요약 (GPT 배정 근거)
const CHARS = [
  { key: 'hamlet', name: '햄릿', desc: '신중하고 깊이 있는 사색가 — 고뇌·성찰·심리·죽음·미스터리' },
  { key: 'macbeth', name: '맥베스', desc: '야망으로 불타는 승부사 — 야망·권력·욕망·몰락·비극' },
  { key: 'romeo', name: '로미오', desc: '순수하고 뜨거운 로맨티스트 — 사랑·로맨스·열정·청춘' },
  { key: 'oedipus', name: '오이디푸스', desc: '진실을 향해 나아가는 탐구자 — 진실·추리·미스터리·운명·반전' },
  { key: 'nora', name: '노라', desc: '삶을 개척하는 독립가 — 자유·독립·자아·성장·여성 서사' },
  { key: 'antigone', name: '안티고네', desc: '단단하고 고결한 신념가 — 신념·정의·저항·양심·용기' },
  { key: 'falstaff', name: '팔스타프', desc: '현재를 즐기는 감각주의자 — 코미디·유쾌·유머·즐거움·풍자' },
  { key: 'faust', name: '파우스트', desc: '한계를 넘어서는 초월자 — 욕망·성장·초월·도전·환상' },
]

// KST 기준 오늘 (YYYYMMDD)
function kstToday() {
  const k = new Date(Date.now() + 9 * 3600 * 1000)
  return new Date(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate())
}
function kstDateStr() {
  return fmt(kstToday())
}

// 이번주 대학로 연극 후보 풀 (예매순)
async function candidatePool() {
  const today = kstToday()
  const eddate = fmt(addDays(today, -1))
  const stdate = fmt(addDays(today, -6))
  return getDaehakroPool(stdate, eddate, 60)
}

const stripTag = (t) => String(t || '').replace(/\s*\[[^\]]*\]\s*$/, '').trim()

function buildPrompt(dateStr, candidates) {
  const list = candidates
    .map(
      (c) =>
        `[id:${c.mt20id}] "${stripTag(c.title)}" | 장르:${c.genre || '연극'} | ${c.venue || ''} | 소개:${String(c.intro || '').replace(/\s+/g, ' ').slice(0, 140)}`,
    )
    .join('\n')
  const chars = CHARS.map((c) => `- ${c.key} (${c.name}): ${c.desc}`).join('\n')
  const system =
    '너는 대학로 연극 큐레이터다. 8개의 "극 캐릭터 유형" 각각에 대해, 아래 대학로 연극 후보 중 그 유형의 성향·정서에 가장 잘 어울리는 연극 1편씩을 고른다.\n' +
    '규칙:\n' +
    '- 반드시 후보 목록의 id 중에서만 고른다.\n' +
    '- 가능하면 8개 유형에 서로 다른 연극을 배정한다(후보가 8편 미만이면 중복 허용).\n' +
    '- 각 배정에 한국어 추천 이유(reason)를 20자 이내로 붙인다.\n' +
    '- 다른 말 없이 JSON만 출력한다. 형식: {"map":{"hamlet":{"id":"...","reason":"..."},"macbeth":{...}, ... ,"faust":{...}}}'
  const user = `날짜: ${dateStr}\n\n[캐릭터 유형]\n${chars}\n\n[대학로 연극 후보]\n${list}\n\n각 유형에 어울리는 연극을 배정해줘.`
  return { system, user }
}

async function callOpenAI({ system, user }) {
  // 환경변수 BOM/제로폭공백 제거 (헤더 ByteString 오류 방지)
  const clean = (s) => String(s || '').replace(/[﻿​￾]/g, '').trim()
  const key = clean(process.env.OPENAI_API_KEY)
  if (!key) throw new Error('OPENAI_API_KEY 미설정')
  const model = clean(process.env.OPENAI_MODEL) || 'gpt-4o'
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0, // 하루 고정: 같은 라인업이면 같은 배정이 나오도록
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  if (!r.ok) {
    const t = await r.text().catch(() => '')
    throw new Error(`OpenAI ${r.status}: ${t.slice(0, 300)}`)
  }
  const j = await r.json()
  const content = j?.choices?.[0]?.message?.content
  if (!content) throw new Error('OpenAI 빈 응답')
  return JSON.parse(content)
}

// KOPIS 후보 → 프론트가 쓰는 추천 필드
function playFields(c, reason) {
  return {
    mt20id: c.mt20id,
    title: c.title,
    poster: c.poster,
    genre: c.genre || '연극',
    venue: c.venue,
    periodFrom: c.periodFrom,
    periodTo: c.periodTo,
    url: c.reservations?.[0]?.url || '',
    reason: String(reason || '').trim(),
  }
}

export async function buildQuizRecommend() {
  const date = kstDateStr()
  const candidates = (await candidatePool()).slice(0, 30)
  if (!candidates.length) throw new Error('상연 중인 대학로 연극 후보가 없습니다')
  const byId = new Map(candidates.map((c) => [String(c.mt20id), c]))

  const map = {}
  try {
    const ai = await callOpenAI(buildPrompt(date, candidates))
    const aimap = ai?.map || {}
    for (const ch of CHARS) {
      const pick = aimap[ch.key]
      const c = pick && byId.get(String(pick.id))
      if (c) map[ch.key] = playFields(c, pick.reason)
    }
  } catch {
    // GPT 실패 시 아래 인덱스 폴백으로 전부 채운다
  }
  // 비어 있는 유형은 후보 인덱스로 폴백 (캐릭터마다 서로 다른 실제 공연 보장)
  CHARS.forEach((ch, i) => {
    if (!map[ch.key]) map[ch.key] = playFields(candidates[i % candidates.length], '')
  })
  return { date, map }
}

// 날짜 키로 "진행 중 Promise"를 캐시 → 하루 1회만 GPT 호출 (동시 요청은 같은 결과 공유)
let _cache = { date: '', promise: null }

export async function handleQuizRecommend(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  // 브라우저 30분 / CDN 12시간 캐시 → OpenAI 호출 추가 억제
  res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=43200, stale-while-revalidate=86400')
  try {
    const date = kstDateStr()
    if (_cache.date !== date || !_cache.promise) {
      _cache = { date, promise: buildQuizRecommend() }
    }
    const data = await _cache.promise
    res.statusCode = 200
    res.end(JSON.stringify(data))
  } catch (err) {
    _cache = { date: '', promise: null } // 실패 캐시 무효화 → 다음 요청 재시도
    res.statusCode = 502
    res.end(JSON.stringify({ error: String(err?.message || err) }))
  }
}
