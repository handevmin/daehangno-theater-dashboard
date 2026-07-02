// AI 추천(대학로 한정) 코어 — GPT가 "의미+절기(우선) > 날씨"를 종합해 대학로 연극 2편을 추천한다.
// 오늘 ±7일 윈도우의 의미/절기(엑셀 달력)와 서울 날씨를 근거로, 실제 상연 중인 대학로 연극 후보 중에서 고른다.
// 반환 형태는 추천 페이지(CurationContent)와 동일 → AI 페이지가 그대로 렌더한다.
import { getDaehakroPool, fmt, addDays } from './_dashboard.js'
import { eventsInWindow } from './_calendar.js'

const DAEHAKRO = { lat: 37.582, lng: 127.003 }
const WINDOW_DAYS = 7

// KST 벽시계 기준 오늘 0시 Date
function kstToday() {
  const k = new Date(Date.now() + 9 * 3600 * 1000)
  return new Date(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate())
}
// "2026.07.02" / "2026-07-02" → Date (없으면 null)
function parseYmd(s) {
  const m = String(s ?? '').match(/(\d{4})[.\-](\d{2})[.\-](\d{2})/)
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null
}

// WMO weathercode → 한글 설명
const WMO = {
  0: '맑음', 1: '대체로 맑음', 2: '구름 조금', 3: '흐림',
  45: '안개', 48: '짙은 안개', 51: '약한 이슬비', 53: '이슬비', 55: '강한 이슬비',
  61: '약한 비', 63: '비', 65: '강한 비', 66: '어는 비', 67: '어는 비',
  71: '약한 눈', 73: '눈', 75: '강한 눈', 77: '싸락눈',
  80: '약한 소나기', 81: '소나기', 82: '강한 소나기', 85: '약한 눈소나기', 86: '눈소나기',
  95: '뇌우', 96: '우박 동반 뇌우', 99: '강한 우박 뇌우',
}

async function fetchWeather() {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${DAEHAKRO.lat}&longitude=${DAEHAKRO.lng}` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&timezone=Asia%2FSeoul&forecast_days=8`
    const r = await fetch(url)
    if (!r.ok) return null
    const j = await r.json()
    const d = j?.daily
    if (!d?.time) return null
    return d.time.map((date, i) => ({
      date,
      desc: WMO[d.weathercode?.[i]] ?? '',
      tmax: Math.round(d.temperature_2m_max?.[i]),
      tmin: Math.round(d.temperature_2m_min?.[i]),
      rain: d.precipitation_probability_max?.[i] ?? null,
    }))
  } catch {
    return null
  }
}

// 오늘 ±7일에 상연되는(기간이 겹치는) 대학로 연극 후보
async function candidatePool() {
  const today = kstToday()
  const stdate = fmt(addDays(today, -7))
  const eddate = fmt(addDays(today, -1))
  const pool = await getDaehakroPool(stdate, eddate, 60)
  const winStart = addDays(today, -WINDOW_DAYS)
  const winEnd = addDays(today, WINDOW_DAYS)
  return pool.filter((p) => {
    const s = parseYmd(p.periodFrom)
    const e = parseYmd(p.periodTo)
    if (s && s > winEnd) return false // 아직 개막 전(윈도우 이후)
    if (e && e < winStart) return false // 이미 종연(윈도우 이전)
    return true
  })
}

function buildPrompt({ today, events, weather, candidates }) {
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`
  const evLines = events.length
    ? events
        .map((e) => {
          const when = e.offset === 0 ? '오늘' : e.offset > 0 ? `${e.offset}일 뒤` : `${-e.offset}일 전`
          return `- [${e.kind}] ${e.name} (${e.date}, ${when}): ${e.note}`
        })
        .join('\n')
    : '- (이번 ±7일 윈도우에 특별한 의미/절기 없음 — 계절 분위기만 참고)'
  const wLines = weather
    ? weather
        .slice(0, 8)
        .map((w) => `- ${w.date}: ${w.desc}, ${w.tmin}~${w.tmax}°C${w.rain != null ? `, 강수확률 ${w.rain}%` : ''}`)
        .join('\n')
    : '- (날씨 정보 없음)'
  const cLines = candidates
    .map((c, i) => {
      const intro = String(c.intro || '').replace(/\s+/g, ' ').slice(0, 180)
      const cast = (c.cast || []).slice(0, 4).join(', ')
      return `${i + 1}. id=${c.mt20id} | ${c.title} | ${c.genre} | 기간 ${c.periodFrom}~${c.periodTo} | 러닝타임 ${c.runtime || '?'} | 관람연령 ${c.ageNum || '?'} | 좌석 ${c.seatScale || '?'}석${cast ? ` | 출연 ${cast}` : ''}${intro ? ` | 소개 ${intro}` : ''}`
    })
    .join('\n')

  const system =
    '너는 서울 대학로 공연을 큐레이션하는 전문 에디터다. ' +
    '오늘 날짜의 "의미(기념일·명절·특일)와 절기"를 최우선으로, 그다음 "날씨"를 보조로 고려해 ' +
    '아래 후보(모두 실제 상연 중인 대학로 연극) 중에서 딱 2편을 골라 추천한다. ' +
    '반드시 후보 목록에 있는 id만 사용하고, 없는 공연을 지어내지 마라. ' +
    '추천 이유(quote)는 의미/절기와의 연결을 자연스럽게 담되 한 문장으로 간결하게 쓴다. ' +
    '모든 텍스트는 한국어. 오직 JSON만 출력한다.'

  const user =
    `[오늘] ${dateStr}\n\n` +
    `[의미·절기 — 최우선 고려, ±7일 윈도우]\n${evLines}\n\n` +
    `[서울(대학로) 날씨 — 보조 고려]\n${wLines}\n\n` +
    `[추천 후보 (대학로 연극, 이 중에서만 선택)]\n${cLines}\n\n` +
    `[출력 JSON 스키마]\n` +
    `{\n` +
    `  "hashtag": "짧은 분위기 해시태그(예: 가족의 하루) — # 제외, 10자 이내",\n` +
    `  "moodTitle": "분위기 제목(짧게, 8자 내외)",\n` +
    `  "moodDesc": "설명. 줄바꿈은 \\n 으로. 최대 3줄, 한 줄 20자 이내, 전체 65자 이내. 오늘의 의미/절기를 언급하며 왜 이런 공연을 추천하는지 간결하게.",\n` +
    `  "vibe": "분위기 버튼 문구(예: 가족 · 감동), 8자 이내",\n` +
    `  "tags": ["짧은 태그", "4~6개", "# 제외"],\n` +
    `  "plays": [ { "id": "후보의 mt20id", "quote": "추천 이유 한 문장(35자 이내, 따옴표 없이)" }, { "id": "...", "quote": "..." } ]\n` +
    `}\n` +
    `plays 는 정확히 2개, 각 공연마다 quote를 반드시 비우지 말고 채운다. 의미/절기와의 적합성이 가장 높은 순서로 정렬.`

  return { system, user }
}

async function callOpenAI({ system, user }) {
  // 환경변수에 BOM(U+FEFF)/제로폭공백이 섞여도 헤더 오류(ByteString)가 안 나도록 정리
  const clean = (s) => String(s || '').replace(/[﻿​ ]/g, '').trim()
  const key = clean(process.env.OPENAI_API_KEY)
  if (!key) throw new Error('OPENAI_API_KEY 미설정')
  const model = clean(process.env.OPENAI_MODEL) || 'gpt-4o'
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.7,
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

// GPT 출력 + 후보 풀 → CurationContent (실제 공연 데이터는 KOPIS 값으로 채움, 문구만 GPT)
function toCuration(ai, candidates) {
  const byId = new Map(candidates.map((c) => [String(c.mt20id), c]))
  const picks = Array.isArray(ai?.plays) ? ai.plays : []
  const chosen = []
  for (const p of picks) {
    const c = byId.get(String(p?.id))
    if (c && !chosen.find((x) => x.mt20id === c.mt20id)) chosen.push({ c, quote: String(p?.quote || '').trim() })
    if (chosen.length >= 2) break
  }
  // GPT가 유효 id를 2개 못 채우면 후보 상위로 보충
  for (const c of candidates) {
    if (chosen.length >= 2) break
    if (!chosen.find((x) => x.c.mt20id === c.mt20id)) chosen.push({ c, quote: '' })
  }
  const plays = chosen.map(({ c, quote }) => ({
    title: c.title,
    venue: c.venue,
    from: c.periodFrom,
    to: c.periodTo,
    runtime: c.runtime,
    age: c.ageNum,
    poster: c.poster, // 원본 URL — 프론트에서 프록시 처리
    quote: quote || '대학로에서 만나는 오늘의 무대',
  }))
  return {
    hashtag: String(ai?.hashtag || 'AI 추천').trim(),
    moodTitle: String(ai?.moodTitle || '오늘의 추천').trim(),
    moodDesc: String(ai?.moodDesc || '').trim(),
    vibe: String(ai?.vibe || '오늘의 무대').trim(),
    tags: Array.isArray(ai?.tags) ? ai.tags.map((t) => String(t).replace(/^#/, '').trim()).filter(Boolean).slice(0, 6) : [],
    plays,
  }
}

export async function buildAiCuration() {
  const today = kstToday()
  const events = eventsInWindow(today, WINDOW_DAYS)
  const [weather, candidates] = await Promise.all([fetchWeather(), candidatePool()])
  if (!candidates.length) throw new Error('상연 중인 대학로 연극 후보가 없습니다')
  const trimmed = candidates.slice(0, 24)
  const ai = await callOpenAI(buildPrompt({ today, events, weather, candidates: trimmed }))
  const content = toCuration(ai, trimmed)
  content.generatedAt = new Date().toISOString()
  content.basis = {
    events: events.map((e) => ({ name: e.name, kind: e.kind, date: e.date })),
    weatherToday: weather?.[0] ?? null,
  }
  return content
}

export async function handleAiCuration(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  try {
    const content = await buildAiCuration()
    res.statusCode = 200
    // 날짜 기반이라 자주 안 바뀜: 브라우저 30분, CDN 6시간 캐시 (OpenAI 호출 절약)
    res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=21600, stale-while-revalidate=86400')
    res.end(JSON.stringify(content))
  } catch (err) {
    res.statusCode = 502
    res.end(JSON.stringify({ error: String(err?.message || err) }))
  }
}
