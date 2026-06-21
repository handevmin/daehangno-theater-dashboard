// 대시보드 페이로드 집계 — 브라우저가 단일 요청(/api/dashboard)으로 전체 데이터를 받도록 서버에서 조립한다.
// 대학로 필터: boxoffice(서울·연극) 예매순위 → 각 공연 상세조회(daehakro=Y)만 추려 재순위.
// 차트(공스피/요일별): KOPIS 집계는 전국·연극 단위만 제공되므로 연극 전국 기준 실데이터를 사용한다.
import { fetchKopisJson } from './_kopis.js'

const GENRE_PLAY = 'AAAA' // 연극
const AREA_SEOUL = '11' // 서울

// 대학로 중심 좌표 + 검증 반경 — daehakro=Y 라도 좌표가 이 반경 밖이면 제외
const DAEHAKRO_CENTER = { lat: 37.582, lng: 127.003 }
const DAEHAKRO_RADIUS_M = 700
function distMeters(la, lo, c) {
  const R = 6371000
  const rad = (x) => (x * Math.PI) / 180
  const dx = rad(lo - c.lng) * Math.cos(rad(c.lat)) * R
  const dy = rad(la - c.lat) * R
  return Math.sqrt(dx * dx + dy * dy)
}
// 좌표가 대학로 반경 안인지 (좌표 없으면 검증 불가 → 제외)
function isNearDaehakro(la, lo) {
  if (la == null || lo == null || !Number.isFinite(la) || !Number.isFinite(lo)) return false
  return distMeters(la, lo, DAEHAKRO_CENTER) <= DAEHAKRO_RADIUS_M
}

// ----- 날짜 유틸 -----
function fmt(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}
function addDays(d, n) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}
// 주차 라벨 (해당 월의 몇째 주). 7일 간격 윈도우와 어긋나지 않게 날짜 기준 단순 계산
// (1~7일=1주, 8~14일=2주 …) → 월 경계에서 건너뜀 없이 연속됨.
function weekLabel(d) {
  const month = d.getMonth() + 1
  const weekOfMonth = Math.ceil(d.getDate() / 7)
  return `${month}월 ${weekOfMonth}주`
}

// 마지막 날이 집계 미완(이상 저값)인지 판정 — KOPIS 일별 집계 1~2일 지연 대응.
// 직전 날들의 중앙값 대비 40% 미만(또는 0)이면 "아직 집계 중"으로 본다.
function isIncompleteLast(rows) {
  const last = rows[rows.length - 1]
  if (!last) return false
  if (!(last.seats > 0)) return true
  const others = rows
    .slice(0, -1)
    .map((r) => r.seats)
    .filter((s) => s > 0)
    .sort((a, b) => a - b)
  if (others.length < 3) return false
  const median = others[Math.floor(others.length / 2)]
  return last.seats < median * 0.4
}
const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토']
const WEEKDAYS_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function toArr(x) {
  if (x === undefined || x === null) return []
  return Array.isArray(x) ? x : [x]
}
function num(x) {
  const n = parseInt(String(x ?? '').replace(/[^\d-]/g, ''), 10)
  return Number.isFinite(n) ? n : 0
}
function ageNumber(prfage) {
  const s = String(prfage ?? '')
  const m = s.match(/(\d+)/)
  if (m) return m[1]
  if (s.includes('전체')) return '전체'
  return ''
}
// dtguidance 에서 HH:MM 추출 (중복 제거, 정렬)
function parseTimes(dtguidance) {
  const s = String(dtguidance ?? '')
  const times = [...s.matchAll(/(\d{1,2}:\d{2})/g)].map((m) => m[1])
  return [...new Set(times)].sort()
}

// ----- 회차 시각 계산 (KST) -----
const WD_KO = ['일', '월', '화', '수', '목', '금', '토']
// 현재 KST 시각 ms (UTC 필드를 KST 벽시계로 사용)
function nowKstMs() {
  return Date.now() + 9 * 3600 * 1000
}
// "2026.07.18" → KST 프레임 자정 ms (없으면 null)
function ymdToMs(s) {
  const m = String(s ?? '').match(/(\d{4})\.(\d{2})\.(\d{2})/)
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null
}
// "1시간 50분" / "90분" / "1시간" → 분 (없으면 0)
function parseRuntime(s) {
  const t = String(s ?? '')
  const h = t.match(/(\d+)\s*시간/)
  const mm = t.match(/(\d+)\s*분/)
  return (h ? +h[1] * 60 : 0) + (mm ? +mm[1] : 0)
}
// 자정기준 분 → "HH:MM"
function minToHHMM(mins) {
  return `${String(Math.floor(mins / 60) % 24).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
}
// dtguidance → {요일(0=일..6=토): [시각]} (파싱 실패 시 null)
function parseSchedule(dt) {
  const s = String(dt ?? '')
  const map = {}
  let found = false
  const re = /([일월화수목금토])(?:요일)?\s*(?:~\s*([일월화수목금토])(?:요일)?)?\s*\(([^)]*)\)/g
  let m
  while ((m = re.exec(s))) {
    const times = [...m[3].matchAll(/(\d{1,2}):(\d{2})/g)].map((t) => `${t[1].padStart(2, '0')}:${t[2]}`)
    if (!times.length) continue
    const startWd = WD_KO.indexOf(m[1])
    const endWd = m[2] ? WD_KO.indexOf(m[2]) : startWd
    let d = startWd
    for (let k = 0; k < 7; k++) {
      map[d] = map[d] || new Set()
      times.forEach((t) => map[d].add(t))
      if (d === endWd) break
      d = (d + 1) % 7
    }
    found = true
  }
  if (!found) return null
  const out = {}
  for (const k of Object.keys(map)) out[k] = [...map[k]].sort()
  return out
}
// 공연의 "현재 시각(KST) 이후 가장 가까운 회차" (없으면 null)
function nextShow(item) {
  const now = nowKstMs()
  const nowD = new Date(now)
  const today0 = Date.UTC(nowD.getUTCFullYear(), nowD.getUTCMonth(), nowD.getUTCDate())
  const start = ymdToMs(item.periodFrom)
  const end = ymdToMs(item.periodTo)
  const sched = parseSchedule(item.showGuidance)
  const runtime = parseRuntime(item.runtime)
  // 개막 전 공연도 첫 공연일을 찾도록 시작일(미래면 그 날)부터 공연 종료일까지 탐색 (안전상 최대 400일)
  const from = start !== null ? Math.max(today0, start) : today0
  for (let off = (from - today0) / 86400000; off <= (from - today0) / 86400000 + 400; off++) {
    const dayMs = today0 + off * 86400000
    if (end !== null && dayMs > end) break
    const wd = new Date(dayMs).getUTCDay()
    const times = sched ? sched[wd] || [] : item.times
    // 그날의 "아직 안 지난" 회차들 (요일별 스케줄 기준) — 화면엔 이 그날 시간대만 보여준다
    const dayTimes = [...times].sort().filter((t) => {
      const [hh, mi] = t.split(':').map(Number)
      return dayMs + (hh * 60 + mi) * 60000 >= now
    })
    if (dayTimes.length) {
      const t = dayTimes[0]
      const [hh, mi] = t.split(':').map(Number)
      const startMs = dayMs + (hh * 60 + mi) * 60000
      const range = runtime ? `${t}-${minToHHMM(hh * 60 + mi + runtime)}` : t
      const dd = new Date(dayMs)
      const dayLabel =
        off === 0 ? '오늘' : off === 1 ? '내일' : `${dd.getUTCMonth() + 1}.${dd.getUTCDate()}(${WD_KO[wd]})`
      return { range, dayLabel, sortKey: startMs, dayTimes }
    }
  }
  return null
}
// 공연이 "오늘" 무대에 오르는지 + 오늘 회차 시간들 (오늘 공연 없으면 null)
function todayShow(item) {
  const now = nowKstMs()
  const nowD = new Date(now)
  const today0 = Date.UTC(nowD.getUTCFullYear(), nowD.getUTCMonth(), nowD.getUTCDate())
  const start = ymdToMs(item.periodFrom)
  const end = ymdToMs(item.periodTo)
  if (start !== null && today0 < start) return null // 아직 개막 전
  if (end !== null && today0 > end) return null // 이미 종연
  const sched = parseSchedule(item.showGuidance)
  const wd = new Date(today0).getUTCDay()
  const times = [...(sched ? sched[wd] || [] : item.times || [])].sort()
  if (!times.length) return null // 오늘 요일엔 공연 없음
  const runtime = parseRuntime(item.runtime)
  // 화면엔 "오늘 전체 시간표"를 일관되게 표시 (예매사이트 그날 회차와 동일). range는 다음(안 지난) 회차 기준.
  const upcoming = times.filter((t) => {
    const [h, m] = t.split(':').map(Number)
    return today0 + (h * 60 + m) * 60000 >= now
  })
  const base = upcoming[0] || times[0]
  const [h, m] = base.split(':').map(Number)
  const range = runtime ? `${base}-${minToHHMM(h * 60 + m + runtime)}` : base
  return { times, range, dayLabel: '오늘' }
}

// ----- 상세조회 → 통합 아이템 -----
async function fetchDetail(mt20id) {
  const json = await fetchKopisJson(`pblprfr/${mt20id}`)
  const db = json?.dbs?.db
  return Array.isArray(db) ? db[0] : db
}

// 공연시설 상세 → 좌표(위/경도) + 주소
async function fetchFacility(mt10id) {
  if (!mt10id) return null
  try {
    const json = await fetchKopisJson(`prfplc/${mt10id}`)
    const db = json?.dbs?.db
    const d = Array.isArray(db) ? db[0] : db
    if (!d) return null
    const lat = parseFloat(d.la)
    const lng = parseFloat(d.lo)
    return {
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
      address: String(d.adres ?? '').trim(),
    }
  } catch {
    return null
  }
}

function enrich(boxof, detail, rank) {
  const sty = String(detail?.sty ?? '').trim()
  return {
    rank,
    mt20id: boxof.mt20id,
    mt10id: detail?.mt10id ?? '', // 공연시설 ID (좌표 조회용)
    title: detail?.prfnm ?? boxof.prfnm,
    poster: boxof.poster || detail?.poster || '',
    introImages: toArr(detail?.styurls?.styurl).filter(Boolean),
    venue: detail?.fcltynm ?? boxof.prfplcnm ?? '',
    area: detail?.area ?? boxof.area ?? '',
    genre: detail?.genrenm ?? boxof.cate ?? '연극',
    age: String(detail?.prfage ?? '').trim(),
    ageNum: ageNumber(detail?.prfage),
    periodFrom: detail?.prfpdfrom ?? '',
    periodTo: detail?.prfpdto ?? '',
    periodRaw: boxof.prfpd ?? '',
    runtime: String(detail?.prfruntime ?? '').trim(),
    price: String(detail?.pcseguidance ?? '').trim(),
    cast: String(detail?.prfcast ?? '')
      .split(/[,，]/)
      .map((s) => s.trim().replace(/\s*등$/, ''))
      .filter(Boolean),
    crew: String(detail?.prfcrew ?? '').trim(),
    intro: sty,
    showGuidance: String(detail?.dtguidance ?? '').trim(),
    times: parseTimes(detail?.dtguidance),
    prfdtcnt: num(boxof.prfdtcnt),
    seatScale: num(boxof.seatcnt),
    state: String(detail?.prfstate ?? '').trim(),
    reservations: toArr(detail?.relates?.relate)
      .map((r) => ({ name: r?.relatenm ?? '', url: r?.relateurl ?? '' }))
      .filter((r) => r.url),
  }
}

// 동시성 제한 병렬 실행
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length)
  let i = 0
  async function worker() {
    while (i < items.length) {
      const idx = i++
      try {
        out[idx] = await fn(items[idx], idx)
      } catch {
        out[idx] = null
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return out
}

// ----- 대학로 연극 풀 (boxoffice 서울·연극 → daehakro=Y) -----
// 예매순위와 "곧 시작할 회차" 둘 다 이 풀에서 파생 (KOPIS 호출 절약)
async function getDaehakroPool(stdate, eddate, maxDetail) {
  const json = await fetchKopisJson('boxoffice', {
    ststype: 'week',
    stdate,
    eddate,
    catecode: GENRE_PLAY,
    area: AREA_SEOUL,
  })
  const list = toArr(json?.boxofs?.boxof).slice(0, maxDetail)
  const details = await mapLimit(list, 8, (b) => fetchDetail(b.mt20id))
  const pool = []
  for (let k = 0; k < list.length; k++) {
    const d = details[k]
    if (d && String(d.daehakro).toUpperCase() === 'Y') {
      pool.push(enrich(list[k], d, pool.length + 1))
    }
  }
  return pool
}

// 곧 시작하는 회차: 풀 각 공연의 "현재 이후 다음 회차"를 구해 빠른 순 정렬 (전체 반환)
function buildSoonShows(pool) {
  const items = []
  for (const p of pool) {
    const ns = nextShow(p)
    // times: 한 주 평탄화 목록 대신 "다음 공연일의 그날 시간대"로 교체 (요일 섞임 방지)
    if (ns) items.push({ ...p, timeRange: ns.range, dayLabel: ns.dayLabel, times: ns.dayTimes?.length ? ns.dayTimes : p.times, _sort: ns.sortKey })
  }
  items.sort((a, b) => a._sort - b._sort)
  return items.map(({ _sort, ...r }) => r)
}

// ----- 연극 집계 (전국) -----
async function playSeatsForRange(stdate, eddate) {
  const json = await fetchKopisJson('boxStatsCate', { stdate, eddate, catecode: GENRE_PLAY })
  const rows = toArr(json?.['box-statsofs']?.boxStatsof)
  const play = rows.find((r) => r.catenm === '연극') ?? rows[0]
  return { tot: num(play?.totnmrssm), ntss: num(play?.ntssnmrssm) }
}

export async function buildDashboard() {
  const today = new Date()
  const eddate = addDays(today, -1) // 어제까지 (집계 완료 구간)
  const stdate = addDays(eddate, -6) // 최근 7일 = 이번주

  // 1) 대학로 연극 풀 → TOP 10 + 곧 시작할 회차 (한 번의 풀에서 파생)
  const pool = await getDaehakroPool(fmt(stdate), fmt(eddate), 40)
  // TOP10: "오늘 실제 공연하는" 작품만 예매순위대로 추려 1~10위 재부여 (개막 전 선예매 등 제외)
  const top = []
  for (const p of pool) {
    const ts = todayShow(p)
    if (!ts) continue
    top.push({ ...p, rank: top.length + 1, times: ts.times, timeRange: ts.range, dayLabel: ts.dayLabel })
    if (top.length >= 10) break
  }

  // 곧 시작할 회차 후보(전체, 시각순) — 위치는 프론트의 공연장 좌표 테이블로 매칭/필터한다
  // (KOPIS 좌표는 부정확해서 사용하지 않음)
  const soonAll = buildSoonShows(pool)
  const soon = { items: soonAll, total: soonAll.length }

  // 2) 요일별 예매 — 항상 연속 7일(막대 7개) 유지. 단 마지막 날(어제)이 집계 미완이면
  //    하루 당겨 "그제까지의 7일"을 사용한다. (판정 위해 앞에 하루 더 받아 8일치 확보)
  const days8 = Array.from({ length: 8 }, (_, k) => addDays(stdate, k - 1)) // (stdate-1) ~ eddate
  const dayStats8 = await mapLimit(days8, 8, (d) => playSeatsForRange(fmt(d), fmt(d)))
  const rows8 = days8.map((d, k) => ({
    day: WEEKDAYS_EN[d.getDay()],
    dayKo: WEEKDAYS_KO[d.getDay()],
    date: fmt(d),
    seats: dayStats8[k]?.tot ?? 0,
  }))
  // 어제(마지막)가 미완이면 한 칸 당겨 7일, 정상이면 평소 7일 — 막대 개수는 항상 7개로 동일
  const dayOfWeek = isIncompleteLast(rows8) ? rows8.slice(0, 7) : rows8.slice(1, 8)

  // 3) 주간 공스피 추이 (최근 8주, 연극 전국)
  const weekWindows = Array.from({ length: 8 }, (_, k) => {
    const ws = addDays(stdate, -7 * (7 - k))
    const we = addDays(ws, 6)
    return { ws, we }
  })
  const weekStats = await mapLimit(weekWindows, 8, (w) => playSeatsForRange(fmt(w.ws), fmt(w.we)))
  const weeklyTrend = weekWindows.map((w, k) => ({
    label: weekLabel(w.ws),
    seats: weekStats[k]?.tot ?? 0,
  }))

  // 4) 요약 지표 (마지막 미완 날 제외된 dayOfWeek 기준)
  const weekTotalSeats = dayOfWeek.reduce((a, b) => a + b.seats, 0)
  // 미완 날을 이미 뺐으므로 가장 최근(완성) 날을 "오늘의 공스피"로 사용
  const daysWithData = dayOfWeek.filter((d) => d.seats > 0)
  const todaySeats = (daysWithData[daysWithData.length - 1] ?? dayOfWeek[dayOfWeek.length - 1])?.seats ?? 0
  const thisWeekTot = weeklyTrend[weeklyTrend.length - 1]?.seats ?? weekTotalSeats
  const lastWeekTot = weeklyTrend[weeklyTrend.length - 2]?.seats ?? 0
  const weekDeltaPct = lastWeekTot > 0 ? ((thisWeekTot - lastWeekTot) / lastWeekTot) * 100 : 0

  return {
    week: {
      label: weekLabel(stdate),
      stdate: fmt(stdate),
      eddate: fmt(eddate),
    },
    top,
    upcoming: soon.items,
    upcomingCount: soon.total,
    todaySeats,
    weekTotalSeats,
    weekDeltaPct: Math.round(weekDeltaPct * 10) / 10,
    weeklyTrend,
    dayOfWeek,
    generatedAt: new Date().toISOString(),
  }
}

export async function handleDashboard(req, res) {
  try {
    const payload = await buildDashboard()
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600')
    res.end(JSON.stringify(payload))
  } catch (err) {
    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: String(err?.message || err) }))
  }
}
