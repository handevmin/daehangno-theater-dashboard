import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, ChevronLeft, RotateCcw, Share2 } from "lucide-react";
import {
  META,
  QUESTIONS,
  RESULTS,
  computeResult,
  fullImg,
  circleImg,
  COVER_IMG,
  type CharKey,
} from "./quizData";
import "./quiz.css";

type Stage = "start" | "quiz" | "loading" | "result";

export default function QuizPage() {
  const [stage, setStage] = useState<Stage>("start");
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<CharKey[]>([]);
  const total = QUESTIONS.length;

  // 결과 캐릭터 (로딩/결과 단계에서 확정)
  const resultKey = useMemo<CharKey | null>(
    () => (picks.length === total ? computeResult(picks) : null),
    [picks, total],
  );

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

  // 단계가 바뀌면 스크롤 최상단
  const scrollTop = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollTop.current?.scrollIntoView();
    window.scrollTo(0, 0);
  }, [stage, index]);

  function start() {
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
    setPicks([]);
    setIndex(0);
    setStage("start");
  }

  async function share() {
    const url = window.location.href;
    const text = `${META.title} — ${META.subtitle}`;
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
          <ResultView charKey={resultKey} onRestart={restart} onShare={share} />
        )}
      </div>
    </div>
  );
}

/* ── 시작 ── */
function StartView({ onStart }: { onStart: () => void }) {
  return (
    <div className="gcq-start">
      <h1 className="gcq-title">{META.title}</h1>
      <p className="gcq-subtitle">{META.subtitle}</p>
      <img className="gcq-cover" src={COVER_IMG} alt="극캐감별사 표지" />
      <button className="gcq-btn" onClick={onStart}>
        <ChevronRight />
        {META.startButton}
      </button>
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
  onRestart,
  onShare,
}: {
  charKey: CharKey;
  onRestart: () => void;
  onShare: () => void;
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

      <div className="gcq-actions">
        <button className="gcq-btn" onClick={onShare}>
          <Share2 />
          결과 공유하기
        </button>
        <button className="gcq-btn" onClick={onRestart}>
          <RotateCcw />
          {META.restartText}
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
