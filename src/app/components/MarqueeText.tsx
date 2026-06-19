import { useEffect, useRef, useState } from "react";

// 키프레임 1회 주입 (CSS 파이프라인 비의존). 한 방향(좌) 무한 루프.
let injected = false;
function ensureKeyframes() {
  if (injected || typeof document === "undefined") return;
  injected = true;
  const style = document.createElement("style");
  // 시작점에서 15% 동안 멈췄다가(살짝 정지) 흐른다. 루프 이음새 = 텍스트 시작점이라 매 사이클 처음에 멈춤.
  style.textContent =
    "@keyframes kopis-marquee-loop{0%,15%{transform:translateX(0)}100%{transform:translateX(var(--marquee-shift,0))}}";
  document.head.appendChild(style);
}

// 텍스트가 컨테이너보다 길면 좌로 계속 흐른다(두 벌 이어붙여 끊김 없는 루프). 짧으면 정지.
export function MarqueeText({
  text,
  className,
  gap = 44,
  speed = 15, // px/초 (작을수록 느림)
}: {
  text: string;
  className?: string;
  gap?: number;
  speed?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const [textW, setTextW] = useState(0);
  const [visW, setVisW] = useState(0);

  useEffect(() => {
    ensureKeyframes();
  }, []);

  useEffect(() => {
    const measure = () => {
      const w = wrapRef.current;
      const s = spanRef.current;
      if (!w || !s) return;
      setTextW(s.scrollWidth);
      setVisW(w.clientWidth);
    };
    measure();
    // 웹폰트 로드 후 폭이 바뀌므로 지연 재측정
    const t1 = setTimeout(measure, 300);
    const t2 = setTimeout(measure, 1200);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", measure);
    };
  }, [text]);

  const overflow = textW > 0 && textW > visW + 1;

  if (overflow) {
    const copy = textW + gap; // 한 벌(텍스트 + 간격) 폭
    // 흐르는 구간(85%)이 copy/speed 가 되도록 보정 → 정지 구간 추가해도 스크롤 속도 유지
    const duration = Math.max(5, Math.round(copy / speed / 0.85));
    const trackStyle = {
      animation: `kopis-marquee-loop ${duration}s linear infinite`,
      "--marquee-shift": `-${copy}px`,
    } as Record<string, string>;
    return (
      <div ref={wrapRef} className={`overflow-hidden whitespace-nowrap ${className ?? ""}`}>
        <div className="inline-flex w-max will-change-transform" style={trackStyle as never}>
          <span ref={spanRef} style={{ marginRight: gap }}>
            {text}
          </span>
          <span aria-hidden style={{ marginRight: gap }}>
            {text}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={`overflow-hidden whitespace-nowrap ${className ?? ""}`}>
      <span ref={spanRef} className="inline-block">
        {text}
      </span>
    </div>
  );
}
