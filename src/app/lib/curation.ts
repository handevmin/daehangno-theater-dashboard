// 추천 페이지(서울연극센터 / AI) 콘텐츠 데이터 — 관리자 페이지에서 편집, GitHub 커밋으로 저장.
import raw from "../data/curation.json";

export interface CurationPlay {
  title: string;
  venue: string;
  from: string;
  to: string;
  runtime: string;
  age: string;
  poster: string;
  quote: string;
}
export interface CurationContent {
  hashtag: string;
  moodTitle: string;
  moodDesc: string;
  vibe: string;
  tags: string[];
  plays: CurationPlay[];
}
export type CurationKey = "seoul" | "ai";
export type CurationStore = Record<CurationKey, CurationContent>;

export const CURATION: CurationStore = raw as CurationStore;

export function emptyPlay(): CurationPlay {
  return { title: "", venue: "", from: "", to: "", runtime: "", age: "", poster: "", quote: "" };
}
