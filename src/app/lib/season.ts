// 계절별 메인 컬러 테마.
// 봄(3~5월) 주황 / 여름(6~8월) 청록 / 가을(9~11월) 코랄 / 겨울(12~2월) 보라.
// (피그마 기준 색. 9월은 가을로 분류 — 여름·가을 라벨이 겹쳐 표준 기상학 분기 사용)
export type Season = '봄' | '여름' | '가을' | '겨울';

export function currentSeason(date: Date = new Date()): Season {
  // KST 기준 월
  const m = new Date(date.getTime() + 9 * 3600 * 1000).getUTCMonth() + 1;
  if (m >= 3 && m <= 5) return '봄';
  if (m >= 6 && m <= 8) return '여름';
  if (m >= 9 && m <= 11) return '가을';
  return '겨울';
}

const ACCENT: Record<Season, string> = {
  봄: '#FFB73B',
  여름: '#1EEDB2',
  가을: '#FF717F',
  겨울: '#C991FF',
};

// 현재 계절의 메인 강조색 (기존 노란색 #FDF340 을 대체)
export function seasonAccent(date: Date = new Date()): { season: Season; accent: string } {
  const season = currentSeason(date);
  return { season, accent: ACCENT[season] };
}
