// KOPIS 대시보드 클라이언트 — 서버 프록시(/api/dashboard)에서 가공된 페이로드를 받는다.

export interface Reservation {
  name: string
  url: string
}

export interface PlayItem {
  rank: number
  mt20id: string
  title: string
  poster: string
  introImages: string[]
  venue: string
  area: string
  genre: string
  age: string
  ageNum: string
  periodFrom: string
  periodTo: string
  periodRaw: string
  runtime: string
  price: string
  cast: string[]
  crew: string
  intro: string
  showGuidance: string
  times: string[]
  prfdtcnt: number
  seatScale: number
  state: string
  reservations: Reservation[]
  // "곧 시작할 회차" 전용 (upcoming 항목에만 존재)
  mt10id?: string
  timeRange?: string // 예: "14:00-15:30"
  dayLabel?: string // 예: "오늘" / "내일" / "6.21(토)"
  lat?: number | null // 공연장 위도
  lng?: number | null // 공연장 경도
  address?: string // 공연장 주소
}

export interface TrendPoint {
  label: string
  seats: number
}

export interface DayPoint {
  day: string
  dayKo: string
  date: string
  seats: number
}

export interface ShowingPoint {
  day: string
  dayKo: string
  date: string
  count: number
}

export interface DashboardData {
  week: { label: string; stdate: string; eddate: string }
  top: PlayItem[]
  upcoming: PlayItem[]
  upcomingCount: number
  todaySeats: number
  weekTotalSeats: number
  weekDeltaPct: number
  weeklyTrend: TrendPoint[]
  dayOfWeek: DayPoint[]
  dayShowings: ShowingPoint[]
  generatedAt: string
}

// KOPIS 이미지(HTTP)를 우리 오리진(HTTPS) 프록시로 중계
export function proxyImg(url: string | undefined | null): string {
  if (!url) return ''
  return `/api/kopis-img?url=${encodeURIComponent(url)}`
}

export async function fetchDashboard(signal?: AbortSignal): Promise<DashboardData> {
  // no-store: 브라우저가 옛 응답을 재사용하지 않고 항상 최신 데이터를 받도록
  const res = await fetch('/api/dashboard', { signal, cache: 'no-store' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error || `대시보드 데이터 로드 실패 (${res.status})`)
  }
  return res.json()
}

// 숫자 천단위 콤마
export function fmtNum(n: number): string {
  return new Intl.NumberFormat('ko-KR').format(Math.round(n || 0))
}
