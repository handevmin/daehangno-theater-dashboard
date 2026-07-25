// 극캐감별사 — "내가 만약 연극 속 주인공이라면?"
// 문항/결과 텍스트는 관리자(/admin '극캐감별사 설문' 탭)에서 편집 → src/app/data/quizContent.json 에 저장.
// 아래 타입/헬퍼(채점·이미지 경로)는 코드에 고정, 텍스트 데이터만 JSON 에서 온다.
import content from "../../data/quizContent.json";

export type CharKey =
  | "hamlet" | "macbeth" | "romeo" | "oedipus"
  | "nora" | "antigone" | "falstaff" | "faust";

export interface QuizOption {
  /** 보기 문구 (줄바꿈은 \n) */
  text: string;
  /** 이 보기를 고르면 점수가 쌓이는 캐릭터 */
  char: CharKey;
}

export interface QuizQuestion {
  q: string;
  options: QuizOption[];
}

export interface Chemistry {
  label: string;
  char: CharKey;
}

export interface CharResult {
  key: CharKey;
  name: string;
  /** 결과 상단 한 줄 소개 */
  topTitle: string;
  /** 인용구 (줄 단위) */
  quote: string[];
  /** 인용구 출처 */
  source: string;
  /** 설명 문단 */
  description: string[];
  chemGood: Chemistry;
  chemBad: Chemistry;
}

export interface QuizContent {
  meta: {
    title: string;
    subtitle: string;
    keyColor: string;
    loadingText: string;
    loadingDelay: number;
    startButton: string;
    restartText: string;
  };
  questions: QuizQuestion[];
  results: Record<CharKey, CharResult>;
  gallery: { key: CharKey; name: string; title: string }[];
}

export const KO_TO_KEY: Record<string, CharKey> = {
  "햄릿": "hamlet",
  "맥베스": "macbeth",
  "로미오": "romeo",
  "오이디푸스": "oedipus",
  "노라": "nora",
  "안티고네": "antigone",
  "팔스타프": "falstaff",
  "파우스트": "faust",
};

// ── 편집 가능한 텍스트 데이터 (관리자 저장 → 재배포 시 반영) ──
const DATA = content as unknown as QuizContent;
export const META = DATA.meta;
export const QUESTIONS = DATA.questions;
export const RESULTS = DATA.results;
export const GALLERY = DATA.gallery;

/** 결과 산출: 각 보기가 가리키는 캐릭터에 1점씩. 최고점이 결과.
 * 동점이면 문항에서 먼저 등장(선택)한 캐릭터가 우선. */
export function computeResult(picks: CharKey[]): CharKey {
  const score = {} as Record<CharKey, number>;
  const firstSeen = {} as Record<CharKey, number>;
  picks.forEach((c, i) => {
    score[c] = (score[c] ?? 0) + 1;
    if (firstSeen[c] === undefined) firstSeen[c] = i;
  });
  let best: CharKey = picks[0];
  for (const c of Object.keys(score) as CharKey[]) {
    if (
      score[c] > score[best] ||
      (score[c] === score[best] && firstSeen[c] < firstSeen[best])
    ) {
      best = c;
    }
  }
  return best;
}

/** public/quiz 자산 경로 헬퍼 */
export const fullImg = (k: CharKey) => `/quiz/full/${k}.jpg`;
export const circleImg = (k: CharKey) => `/quiz/circle/${k}.png`;
export const bodyImg = (k: CharKey) => `/quiz/body/${k}.png`; // 투명 배경 전신
export const COVER_IMG = "/quiz/cover.png";

/** URL 공유용: 문자열이 유효한 캐릭터 키인지 */
export function isCharKey(v: string | null): v is CharKey {
  return !!v && GALLERY.some((g) => g.key === v);
}
