import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Share2,
  Users,
} from "lucide-react";
import {
  META,
  QUESTIONS,
  RESULTS,
  GALLERY,
  computeResult,
  fullImg,
  circleImg,
  bodyImg,
  COVER_IMG,
  isCharKey,
  type CharKey,
} from "./quizData";
import { fetchDashboard, proxyImg, type PlayItem } from "../../lib/kopis";
import "./quiz.css";

// 대시보드 연극 제목의 "[대학로]" 등 꼬리표 제거
const cleanTitle = (t: string) => t.replace(/\s*\[[^\]]*\]\s*$/, "").trim();

// 캐릭터별 추천용 무드 키워드 — 현재 공연의 제목/소개글에서 이 단어들을 찾아 매칭한다.
const CHAR_KEYWORDS: Record<CharKey, string[]> = {
  hamlet: ["고독", "고뇌", "심리", "복수", "죽음", "질문", "사색", "미스터리", "존재", "선택", "우울"],
  macbeth: ["야망", "권력", "욕망", "몰락", "배신", "승부", "범죄", "비극", "왕", "음모"],
  romeo: ["사랑", "로맨스", "연애", "멜로", "청춘", "설렘", "이별", "운명", "그대", "연인"],
  oedipus: ["진실", "비밀", "추리", "미스터리", "수사", "정체", "반전", "사건", "실체", "추적"],
  nora: ["여성", "자유", "독립", "자아", "성장", "엄마", "그녀", "여자", "떠나", "나를"],
  antigone: ["정의", "신념", "저항", "양심", "용기", "진실", "법", "싸움", "지키", "옳"],
  falstaff: ["코미디", "유쾌", "웃음", "코믹", "개그", "유머", "행복", "즐거", "발칙", "한바탕", "축제"],
  faust: ["욕망", "성장", "초월", "거래", "꿈", "도전", "환상", "변신", "계약", "열망"],
};

// 캐릭터 고정 순서 — 키워드 매칭 실패 시 서로 다른 공연을 배정하기 위한 인덱스
const CHAR_ORDER: CharKey[] = [
  "hamlet", "macbeth", "romeo", "oedipus", "nora", "antigone", "falstaff", "faust",
];

// 결과 캐릭터에게 어울리는 공연 1편 선택 (폴백용 클라이언트 매칭).
// 1) 무드 키워드가 제목/소개글/장르에 가장 많이 걸리는 공연 우선
// 2) 매칭이 없으면 캐릭터 고정 인덱스로 배정(캐릭터마다 다른 현재 공연 보장)
function pickRecommend(charKey: CharKey, plays: PlayItem[]): PlayItem | null {
  if (!plays.length) return null;
  const kws = CHAR_KEYWORDS[charKey] ?? [];
  const scored = plays.map((p) => {
    const hay = `${p.title} ${p.intro ?? ""} ${p.genre ?? ""}`;
    const score = kws.reduce((s, k) => (hay.includes(k) ? s + 1 : s), 0);
    return { p, score };
  });
  const best = scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)[0];
  if (best) return best.p;
  const idx = CHAR_ORDER.indexOf(charKey);
  return plays[(idx >= 0 ? idx : 0) % plays.length];
}

// 추천 카드가 쓰는 정규화 형태 (AI 응답 / 폴백 공통)
interface Recommend {
  title: string;
  poster: string;
  genre: string;
  venue: string;
  periodFrom?: string;
  periodTo?: string;
  url?: string;
  reason?: string;
}
function toRecommend(p: PlayItem | null): Recommend | null {
  if (!p) return null;
  return {
    title: p.title,
    poster: p.poster,
    genre: p.genre,
    venue: p.venue,
    periodFrom: p.periodFrom,
    periodTo: p.periodTo,
    url: p.reservations?.[0]?.url || "",
    reason: "",
  };
}

type Stage = "start" | "quiz" | "loading" | "result" | "gallery";

// 공유 링크로 들어온 경우(?result=키) 초기 상태 계산 — 결과 화면으로 바로 진입
function initialFromUrl(): { stage: Stage; forced: CharKey | null } {
  try {
    const v = new URLSearchParams(window.location.search).get("result");
    if (isCharKey(v)) return { stage: "result", forced: v };
  } catch {
    /* SSR 등 */
  }
  return { stage: "start", forced: null };
}

export default function QuizPage() {
  const boot = useMemo(initialFromUrl, []);
  const [stage, setStage] = useState<Stage>(boot.stage);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<CharKey[]>([]);
  // 공유 링크로 진입했을 때 강제로 보여줄 결과 캐릭터 (퀴즈를 안 풀었어도 표시)
  const [forcedResult, setForcedResult] = useState<CharKey | null>(boot.forced);
  const total = QUESTIONS.length;

  // 결과 캐릭터 — 공유 링크의 강제값 우선, 없으면 퀴즈 응답으로 산출
  const resultKey = useMemo<CharKey | null>(
    () =>
      forcedResult ?? (picks.length === total ? computeResult(picks) : null),
    [forcedResult, picks, total],
  );

  // 캐릭터별 추천 공연 —
  // 1순위: 매일 GPT가 정해두는 /api/quiz-recommend (하루 고정, 캐릭터→연극 맵)
  // 폴백: 대시보드 풀 + 클라이언트 키워드 매칭
  const [recMap, setRecMap] = useState<Record<string, Recommend> | null>(null);
  const [plays, setPlays] = useState<PlayItem[]>([]);
  useEffect(() => {
    let alive = true;
    fetch("/api/quiz-recommend")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (alive && d?.map) setRecMap(d.map);
      })
      .catch(() => {
        // 폴백: 대시보드 풀을 받아 클라이언트에서 키워드 매칭
        fetchDashboard()
          .then((d) => {
            if (!alive) return;
            const seen = new Set<string>();
            setPlays(
              [...(d.top ?? []), ...(d.smallTop ?? [])].filter((p) => {
                if (seen.has(p.mt20id)) return false;
                seen.add(p.mt20id);
                return true;
              }),
            );
          })
          .catch(() => {
            /* 추천 공연은 부가 기능이라 실패해도 무시 */
          });
      });
    return () => {
      alive = false;
    };
  }, []);

  // 결과 캐릭터에게 어울리는 공연 (캐릭터별 맞춤)
  const recommend = useMemo<Recommend | null>(() => {
    if (!resultKey) return null;
    if (recMap && recMap[resultKey]) return recMap[resultKey];
    if (plays.length) return toRecommend(pickRecommend(resultKey, plays));
    return null;
  }, [resultKey, recMap, plays]);

  // 페이지 진입 시 문서 제목 갱신
  useEffect(() => {
    const prev = document.title;
    document.title = META.title;
    return () => {
      document.title = prev;
    };
  }, []);

  // 로딩 → 결과 자동 전환
  useEffect(() => {
    if (stage !== "loading") return;
    const t = setTimeout(() => setStage("result"), META.loadingDelay);
    return () => clearTimeout(t);
  }, [stage]);

  // 참여 통계 집계 — 실제로 퀴즈를 풀어 결과에 도달했을 때 1건 기록.
  // (공유 링크 ?result= 로 들어온 경우는 forcedResult 라서 집계 제외). 세션당 1회.
  const loggedRef = useRef(false);
  useEffect(() => {
    if (stage === "result" && !forcedResult && resultKey && !loggedRef.current) {
      loggedRef.current = true;
      fetch("/api/quiz-stat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: resultKey }),
        keepalive: true,
      }).catch(() => {
        /* 집계 실패는 사용자 경험에 영향 없음 */
      });
    }
  }, [stage, forcedResult, resultKey]);

  // 단계가 바뀌면 스크롤 최상단
  const scrollTop = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollTop.current?.scrollIntoView();
    window.scrollTo(0, 0);
  }, [stage, index]);

  // 결과/갤러리 화면이면 주소창에 ?result=키 를 반영 → 공유 시 "내 결과 페이지"가 열린다.
  // 그 외 화면(시작/문항/로딩)에서는 파라미터 제거.
  useEffect(() => {
    const onResult = (stage === "result" || stage === "gallery") && resultKey;
    const url = onResult
      ? `${window.location.pathname}?result=${resultKey}`
      : window.location.pathname;
    if (window.location.pathname + window.location.search !== url) {
      window.history.replaceState(null, "", url);
    }
  }, [stage, resultKey]);

  function start() {
    setForcedResult(null);
    setPicks([]);
    setIndex(0);
    setStage("quiz");
  }

  function choose(char: CharKey) {
    const next = [...picks.slice(0, index), char];
    setPicks(next);
    if (index + 1 < total) {
      setIndex(index + 1);
    } else {
      setStage("loading");
    }
  }

  function back() {
    if (index === 0) return;
    setIndex(index - 1);
  }

  function restart() {
    setForcedResult(null);
    setPicks([]);
    setIndex(0);
    setStage("start");
  }

  async function share() {
    // 결과 파라미터가 반영된 현재 URL을 공유 → 받는 사람은 내 결과 페이지로 진입
    const url = resultKey
      ? `${window.location.origin}${window.location.pathname}?result=${resultKey}`
      : window.location.href;
    const text = resultKey
      ? `${META.title} — 나는 '${RESULTS[resultKey].name}' 유형!`
      : `${META.title} — ${META.subtitle}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: META.title, text, url });
        return;
      }
    } catch {
      /* 사용자가 공유를 취소한 경우 등은 무시 */
    }
    try {
      await navigator.clipboard.writeText(url);
      alert("링크가 복사되었어요! 친구에게 붙여넣어 공유해보세요.");
    } catch {
      /* 클립보드 접근 불가 환경 */
    }
  }

  return (
    <div className="gcq">
      <div className="gcq-frame" ref={scrollTop}>
        {stage === "start" && <StartView onStart={start} />}
        {stage === "quiz" && (
          <QuizView
            key={index}
            index={index}
            total={total}
            onChoose={choose}
            onBack={back}
          />
        )}
        {stage === "loading" && <LoadingView />}
        {stage === "result" && resultKey && (
          <ResultView
            charKey={resultKey}
            recommend={recommend}
            onRestart={restart}
            onShare={share}
            onGallery={() => setStage("gallery")}
          />
        )}
        {stage === "gallery" && (
          <GalleryView
            initialKey={resultKey}
            onBack={() => setStage("result")}
          />
        )}
      </div>
    </div>
  );
}

/* ── 시작 ── */
function StartView({ onStart }: { onStart: () => void }) {
  return (
    <div className="gcq-start">
      {/* 본문 — 남는 공간에서 세로 중앙 */}
      <div className="gcq-start-main">
        <h1 className="gcq-title">{META.title}</h1>
        <p className="gcq-subtitle">{META.subtitle}</p>
        <img className="gcq-cover" src={COVER_IMG} alt="극캐감별사 표지" />
        <button className="gcq-btn" onClick={onStart}>
          <ChevronRight />
          {META.startButton}
        </button>
      </div>
      {/* 주최/주관 로고 — 화면 하단에 고정 */}
      <div className="gcq-logos">
        <img className="gcq-logo-sfac" src="/quiz/logo/sfac.png" alt="서울문화재단" />
        <img className="gcq-logo-dh" src="/quiz/logo/daehakro.png" alt="樂 대학로" />
      </div>
    </div>
  );
}

/* ── 문항 ── */
function QuizView({
  index,
  total,
  onChoose,
  onBack,
}: {
  index: number;
  total: number;
  onChoose: (c: CharKey) => void;
  onBack: () => void;
}) {
  const question = QUESTIONS[index];
  const fill = ((index + 1) / total) * 100;
  return (
    <div className="gcq-quiz">
      <div className="gcq-progress">
        <div className="gcq-count">
          {index + 1}/{total}
        </div>
        <div className="gcq-progress-row">
          <button
            className="gcq-back"
            onClick={onBack}
            disabled={index === 0}
            aria-label="이전 문항"
          >
            <ChevronLeft />
          </button>
          <div className="gcq-track">
            <div className="gcq-fill" style={{ width: `${fill}%` }} />
          </div>
        </div>
      </div>

      <div className="gcq-fade">
        <div className="gcq-qnum">Q{index + 1}.</div>
        <p className="gcq-qtext">{question.q}</p>

        <div className="gcq-options">
          {question.options.map((opt, i) => (
            <button
              key={i}
              className="gcq-option"
              onClick={() => onChoose(opt.char)}
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 로딩 ── */
function LoadingView() {
  return (
    <div className="gcq-loading">
      <div className="gcq-spinner" />
      <div className="gcq-loading-text">
        {META.loadingText}
        <span className="gcq-loading-dots" />
      </div>
    </div>
  );
}

/* ── 결과 ── */
function ResultView({
  charKey,
  recommend,
  onRestart,
  onShare,
  onGallery,
}: {
  charKey: CharKey;
  recommend: Recommend | null;
  onRestart: () => void;
  onShare: () => void;
  onGallery: () => void;
}) {
  const r = RESULTS[charKey];
  return (
    <div className="gcq-result">
      <div className="gcq-banner">
        <img src={fullImg(r.key)} alt={r.name} />
      </div>

      <div className="gcq-card">
        <div className="gcq-r-toptitle">{r.topTitle}</div>
        <div className="gcq-r-name">{r.name}</div>

        <div className="gcq-divider" />

        <div className="gcq-quote">
          {r.quote.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
        {r.source && <div className="gcq-source">{r.source}</div>}

        <div className="gcq-divider" />

        <div className="gcq-desc">
          {r.description.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="gcq-chem">
          <ChemCol chem={r.chemGood} />
          <ChemCol chem={r.chemBad} />
        </div>
      </div>

      {recommend && <RecommendCard rec={recommend} charName={r.name} />}

      <div className="gcq-actions">
        <button className="gcq-btn" onClick={onShare}>
          <Share2 />
          결과 공유하기
        </button>
        <button className="gcq-btn" onClick={onRestart}>
          <RotateCcw />
          {META.restartText}
        </button>
        <button className="gcq-btn gcq-btn-ghost" onClick={onGallery}>
          <Users />
          다른 캐릭터 확인하기
        </button>
      </div>
    </div>
  );
}

function ChemCol({ chem }: { chem: { label: string; char: CharKey } }) {
  const c = RESULTS[chem.char];
  return (
    <div className="gcq-chem-col">
      <div className="gcq-chem-label">{chem.label}</div>
      <img className="gcq-chem-img" src={circleImg(chem.char)} alt={c.name} />
      <div className="gcq-chem-name">{c.name}</div>
    </div>
  );
}

/* ── 캐릭터별 맞춤 추천 공연 (매일 GPT가 대학로 연극에서 배정) ── */
function RecommendCard({ rec, charName }: { rec: Recommend; charName: string }) {
  const url = rec.url || "";
  const period =
    rec.periodFrom && rec.periodTo ? `${rec.periodFrom} ~ ${rec.periodTo}` : "";
  const Wrapper = url ? "a" : "div";
  return (
    <div className="gcq-rec">
      <div className="gcq-rec-heading">
        <span className="gcq-rec-heading-name">{charName}</span>에게 어울리는 공연
      </div>
      <Wrapper
        className="gcq-rec-card"
        {...(url ? { href: url, target: "_blank", rel: "noreferrer" } : {})}
      >
        {rec.poster && (
          <img
            className="gcq-rec-poster"
            src={proxyImg(rec.poster)}
            alt={cleanTitle(rec.title)}
          />
        )}
        <div className="gcq-rec-info">
          <span className="gcq-rec-genre">{rec.genre || "연극"}</span>
          <div className="gcq-rec-title">{cleanTitle(rec.title)}</div>
          {rec.reason && <div className="gcq-rec-reason">“{rec.reason}”</div>}
          {rec.venue && <div className="gcq-rec-venue">{rec.venue}</div>}
          {period && <div className="gcq-rec-period">{period}</div>}
          {url && <span className="gcq-rec-cta">예매하러 가기 →</span>}
        </div>
      </Wrapper>
    </div>
  );
}

/* ── 다른 캐릭터 확인하기 — 센터 대시보드 홍보 슬라이드처럼 가운데 강조 카드로 넘겨보기 ── */
const GAL_CARD_W = 190; // 카드 폭(px)
const GAL_GAP = 14;
const GAL_STEP = GAL_CARD_W + GAL_GAP;
const GAL_HOLD_MS = 2600; // 카드당 노출
const GAL_SLIDE_MS = 560; // 전환 시간

function GalleryView({
  initialKey,
  onBack,
}: {
  initialKey: CharKey | null;
  onBack: () => void;
}) {
  const N = GALLERY.length;
  const startIdx = Math.max(0, GALLERY.findIndex((g) => g.key === initialKey));
  // 3벌 반복 → 가운데 벌에서 시작해 좌우로 무한 순환
  const [active, setActive] = useState(N + startIdx);
  const [anim, setAnim] = useState(true);
  const touchX = useRef<number | null>(null);

  const go = (d: number) => setActive((a) => a + d);

  // 자동 넘김
  useEffect(() => {
    const t = setTimeout(() => setActive((a) => a + 1), GAL_HOLD_MS);
    return () => clearTimeout(t);
  }, [active]);

  // 가운데 벌을 벗어나면 전환이 끝난 뒤 애니메이션 없이 원위치로 스냅(무한 순환)
  useEffect(() => {
    if (active >= 2 * N || active < N) {
      const t = setTimeout(() => {
        setAnim(false);
        setActive((a) => (a >= 2 * N ? a - N : a + N));
      }, GAL_SLIDE_MS);
      return () => clearTimeout(t);
    }
  }, [active, N]);
  useEffect(() => {
    if (anim) return;
    const r = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnim(true)),
    );
    return () => cancelAnimationFrame(r);
  }, [anim]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  const cards = [...GALLERY, ...GALLERY, ...GALLERY];
  const activeMod = ((active % N) + N) % N;

  return (
    <div className="gcq-gallery">
      <div className="gcq-gallery-top">
        <button className="gcq-back" onClick={onBack} aria-label="결과로 돌아가기">
          <ChevronLeft />
        </button>
        <div className="gcq-gallery-title">다른 캐릭터</div>
      </div>

      <div className="gcq-gal-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div
          className="gcq-gal-track"
          style={{
            transform: `translate(${-(active * GAL_STEP + GAL_CARD_W / 2)}px, -50%)`,
            transition: anim
              ? `transform ${GAL_SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
              : "none",
          }}
        >
          {cards.map((c, i) => {
            const r = RESULTS[c.key];
            const isActive = i === active;
            return (
              <div
                key={i}
                className={`gcq-gal-card${isActive ? " active" : ""}`}
                onClick={() => !isActive && setActive(i)}
              >
                <div className="gcq-gal-fig">
                  <img src={bodyImg(c.key)} alt={c.name} />
                </div>
                <div className="gcq-gal-name">{c.name}</div>
                {isActive ? (
                  <>
                    <div className="gcq-gal-quote">
                      {r.quote.map((l, li) => (
                        <div key={li}>{l}</div>
                      ))}
                    </div>
                    <div className="gcq-gal-source">{r.source}</div>
                  </>
                ) : (
                  <div className="gcq-gal-desc">{c.title}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="gcq-gallery-nav">
        <button onClick={() => go(-1)} aria-label="이전 캐릭터">
          <ChevronLeft />
        </button>
        <div className="gcq-gallery-dots">
          {GALLERY.map((g, i) => (
            <span key={g.key} className={i === activeMod ? "on" : ""} />
          ))}
        </div>
        <button onClick={() => go(1)} aria-label="다음 캐릭터">
          <ChevronRight />
        </button>
      </div>

      <button className="gcq-btn gcq-gallery-close" onClick={onBack}>
        내 결과로 돌아가기
      </button>
    </div>
  );
}
