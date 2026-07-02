// 의미 + 절기 달력 — 관리자 제공 엑셀(달력) 기반. AI 추천의 "의미/절기" 컨텍스트로 사용한다.
// 우선순위: 의미 + 절기 > 날씨. 특정 날짜뿐 아니라 그 날짜 ±7일 윈도우에 걸치면 반영한다.
//
// 날짜 인코딩:
//  - SOLAR_TERMS / ANNIVERSARIES: 양력 고정(대략) "MM-DD" → 매년 반복 매칭.
//  - LUNAR_HOLIDAYS: 음력 기반이라 해마다 크게 이동 → 연도별 실제 양력일(YYYY-MM-DD)로 명시.
//    (설날·부처님오신날·추석 등. 새해가 되면 해당 연도 날짜를 추가하면 된다.)

// 24절기 (양력 대략일, ±1일 오차 무방 — 윈도우가 ±7일이라 영향 없음) + 한 줄 의미
export const SOLAR_TERMS = [
  { md: '01-05', name: '소한', note: '한 해 중 가장 추운 시기의 시작, 겨울의 한복판' },
  { md: '01-20', name: '대한', note: '큰 추위, 겨울 추위의 절정이자 마무리' },
  { md: '02-04', name: '입춘', note: '봄의 시작, 새 출발과 희망' },
  { md: '02-19', name: '우수', note: '눈이 녹아 비가 되는 때, 봄기운이 돋음' },
  { md: '03-05', name: '경칩', note: '겨울잠 자던 개구리가 깨어나는 때, 생동' },
  { md: '03-20', name: '춘분', name_alt: '', note: '낮과 밤의 길이가 같아지는 봄의 한가운데' },
  { md: '04-05', name: '청명', note: '하늘이 맑고 밝은 때, 나들이하기 좋은 봄' },
  { md: '04-20', name: '곡우', note: '봄비가 내려 곡식을 기르는 때' },
  { md: '05-05', name: '입하', note: '여름의 시작, 신록이 짙어짐' },
  { md: '05-21', name: '소만', note: '햇볕이 풍부하고 만물이 자라 가득 차는 때' },
  { md: '06-06', name: '망종', note: '씨 뿌리기 좋은 때, 본격적인 농번기' },
  { md: '06-21', name: '하지', note: '낮이 가장 긴 날, 여름의 절정' },
  { md: '07-07', name: '소서', note: '작은 더위, 본격적인 무더위의 시작' },
  { md: '07-23', name: '대서', note: '큰 더위, 한여름 무더위의 절정' },
  { md: '08-07', name: '입추', note: '가을의 시작, 더위 속 서늘함의 기미' },
  { md: '08-23', name: '처서', note: '더위가 한풀 꺾이고 선선해지는 때' },
  { md: '09-07', name: '백로', note: '이슬이 맺히기 시작하는 초가을' },
  { md: '09-23', name: '추분', note: '낮과 밤의 길이가 같아지는 가을의 한가운데' },
  { md: '10-08', name: '한로', note: '찬 이슬이 맺히는 때, 완연한 가을' },
  { md: '10-23', name: '상강', note: '서리가 내리는 때, 단풍이 짙어짐' },
  { md: '11-07', name: '입동', note: '겨울의 시작, 월동 준비' },
  { md: '11-22', name: '소설', note: '첫눈이 내리는 때, 살얼음이 어는 초겨울' },
  { md: '12-07', name: '대설', note: '큰 눈이 내리는 때, 한겨울로 접어듦' },
  { md: '12-22', name: '동지', note: '밤이 가장 긴 날, 팥죽을 먹으며 한 해를 마무리' },
]

// 양력 고정 의미(공휴일·기념일·특일). 성년의 날/청년의 날/수능은 해마다 요일 기준이라 2026 값 사용.
export const ANNIVERSARIES = [
  { md: '01-01', name: '신정', note: '새해 첫날, 새 출발' },
  { md: '02-14', name: '발렌타인데이', note: '사랑을 고백하는 날, 연인' },
  { md: '03-01', name: '삼일절', note: '독립운동을 기리는 국경일' },
  { md: '03-14', name: '화이트데이', note: '사랑을 화답하는 날, 연인' },
  { md: '03-27', name: '세계 연극의 날', note: '연극을 기념하는 날 — 대학로와 가장 잘 어울리는 날' },
  { md: '04-05', name: '식목일', note: '나무를 심는 날, 자연' },
  { md: '04-14', name: '블랙데이', note: '솔로를 위한 날, 위로와 웃음' },
  { md: '04-22', name: '지구의 날', note: '환경을 생각하는 날' },
  { md: '05-01', name: '근로자의 날', note: '노동절, 일하는 사람을 위한 날' },
  { md: '05-05', name: '어린이날', note: '아이들을 위한 날, 가족' },
  { md: '05-08', name: '어버이날', note: '부모님께 감사하는 날, 가족·효' },
  { md: '05-14', name: '로즈데이', note: '장미를 주고받는 연인의 날' },
  { md: '05-15', name: '스승의 날', note: '선생님께 감사하는 날' },
  { md: '05-18', name: '성년의 날', note: '성인이 된 것을 축하하는 날, 청춘' },
  { md: '05-21', name: '부부의 날', note: '부부의 사랑을 기리는 날' },
  { md: '06-06', name: '현충일', note: '나라를 위한 희생을 기리는 날, 추모' },
  { md: '06-14', name: '키스데이', note: '연인의 날' },
  { md: '07-14', name: '실버데이', note: '연인의 날' },
  { md: '07-17', name: '제헌절', note: '헌법 제정을 기념하는 국경일' },
  { md: '08-15', name: '광복절', note: '광복을 기념하는 국경일' },
  { md: '09-19', name: '청년의 날', note: '청년을 응원하는 날' },
  { md: '10-03', name: '개천절', note: '개국을 기념하는 국경일' },
  { md: '10-09', name: '한글날', note: '한글 창제를 기념하는 날' },
  { md: '10-14', name: '와인데이', note: '와인을 나누는 연인의 날' },
  { md: '10-31', name: '할로윈', note: '분장과 축제의 날, 유쾌함·공포' },
  { md: '11-11', name: '빼빼로데이', note: '가벼운 마음을 나누는 날' },
  { md: '11-14', name: '무비데이', note: '영화·공연을 즐기는 날 — 문화와 잘 어울림' },
  { md: '11-19', name: '수능', note: '대학수학능력시험, 수험생과 그 가족' },
  { md: '12-14', name: '허그데이', note: '포옹으로 마음을 전하는 날' },
  { md: '12-24', name: '크리스마스 이브', note: '성탄 전야, 설렘' },
  { md: '12-25', name: '크리스마스', note: '성탄절, 가족·연인·따뜻함' },
]

// 음력 기반 — 연도별 실제 양력일 (2026 기준). 새해가 되면 추가.
export const LUNAR_HOLIDAYS = [
  { date: '2026-02-16', name: '설날 연휴', note: '설 명절, 가족이 모이는 때' },
  { date: '2026-02-17', name: '설날', note: '음력 새해, 가족·명절' },
  { date: '2026-02-18', name: '설날 연휴', note: '설 명절, 가족이 모이는 때' },
  { date: '2026-05-24', name: '부처님 오신 날', note: '자비와 평화를 기리는 날' },
  { date: '2026-09-24', name: '추석 연휴', note: '한가위 명절, 가족이 모이는 때' },
  { date: '2026-09-25', name: '추석', note: '한가위, 가족·풍요·감사' },
  { date: '2026-09-26', name: '추석 연휴', note: '한가위 명절, 가족이 모이는 때' },
]

const pad = (n) => String(n).padStart(2, '0')
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// today(Date, KST 벽시계 기준) ±days 윈도우에 걸치는 의미/절기 목록.
// 반환: [{ name, date:'YYYY-MM-DD', kind:'절기'|'의미', note, offset(일, 음수=지남) }] — 날짜순.
export function eventsInWindow(today, days = 7) {
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const start = new Date(t0); start.setDate(start.getDate() - days)
  const end = new Date(t0); end.setDate(end.getDate() + days)
  const out = []

  const pushIfIn = (dateObj, name, kind, note) => {
    if (dateObj >= start && dateObj <= end) {
      const offset = Math.round((dateObj - t0) / 86400000)
      out.push({ name, date: ymd(dateObj), kind, note, offset })
    }
  }

  // 윈도우가 연말/연초를 걸칠 수 있으니 대상 연도 후보를 모두 시도
  const years = new Set([start.getFullYear(), t0.getFullYear(), end.getFullYear()])
  const expandMd = (md, name, kind, note) => {
    const [mm, dd] = md.split('-').map(Number)
    for (const y of years) pushIfIn(new Date(y, mm - 1, dd), name, kind, note)
  }

  for (const s of SOLAR_TERMS) expandMd(s.md, s.name, '절기', s.note)
  for (const a of ANNIVERSARIES) expandMd(a.md, a.name, '의미', a.note)
  for (const l of LUNAR_HOLIDAYS) {
    const [y, mm, dd] = l.date.split('-').map(Number)
    pushIfIn(new Date(y, mm - 1, dd), l.name, '의미', l.note)
  }

  out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  return out
}
