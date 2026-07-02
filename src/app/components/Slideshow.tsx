import { useEffect, useRef, useState } from "react";
import MapComponent from "../../imports/지도";
import Top5Component from "../../imports/연극15";
import Top610Component from "../../imports/연극610";
import SmallTop5Component from "../../imports/소극장15";
import DashboardComponent from "../../imports/대시보드";
import CurationComponent from "../../imports/추천";
import { useDashboardData } from "../hooks/useDashboardData";

const INTERVAL_MS = 10000; // 기본 전환 주기
const FADE_MS = 1000; // 크로스페이드 시간

const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 1024;

// 화면 순환 순서: 지도 → Top1-5 → Top6-10 → 소극장 Top1-5 → 대시보드 → 서울연극센터 추천 → (반복)
const SLIDES = [MapComponent, Top5Component, Top610Component, SmallTop5Component, DashboardComponent, CurationComponent];

// 지도: 핀 6곳 × 2.8초 = 16.8초 (마지막 핀에서 멈춤).
// 연극 TOP 1~5 / 6~10 / 소극장 Top1-5: 항목 5개 × 2.8초 = 14초 (마지막 항목에서 멈춤, TopPlaysScreen).
// 대시보드/추천: 기본 10초.
const SLIDE_DURATIONS = [16800, 14000, 14000, 14000, INTERVAL_MS, INTERVAL_MS];

// 캡쳐/디버그용: ?slide=N 이면 해당 슬라이드 고정. ?edit=1 이면 지도(0번) 고정.
function lockedSlide(): number | null {
  try {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("edit") === "1") return 0;
    const v = sp.get("slide");
    return v != null ? parseInt(v, 10) : null;
  } catch {
    return null;
  }
}

export default function Slideshow() {
  const { data, loading, error } = useDashboardData();
  const lock = lockedSlide();
  const [index, setIndex] = useState(lock ?? 0);
  const [scale, setScale] = useState(1);
  // 슬라이드별 재마운트 키 — 활성화될 때 +1 해서 마퀴 애니메이션을 처음부터 재시작
  const [nonces, setNonces] = useState<number[]>(() => SLIDES.map(() => 0));
  // 좌우 이동 버튼: 더블클릭하면 숨기고, 같은 자리를 다시 더블클릭하면 표시
  const [navHidden, setNavHidden] = useState(false);
  // 단일클릭(이동) vs 더블클릭(숨김) 구분용 — 더블클릭 시 이동이 발동하지 않게 지연 처리
  const clickTimer = useRef<number | null>(null);
  const goSlide = (dir: number) => {
    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    clickTimer.current = window.setTimeout(() => {
      setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);
      clickTimer.current = null;
    }, 220);
  };
  const hideNav = () => {
    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    setNavHidden(true);
  };

  // 가로 100% 기준으로 스케일 (위쪽 정렬이라 넘치는 아래 빈 영역만 잘림 → 위 안 잘림)
  useEffect(() => {
    const update = () => {
      setScale(window.innerWidth / DESIGN_WIDTH);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // 슬라이드별 체류 시간만큼 머문 뒤 다음 화면으로 (지도는 핀 6곳 다 돈 뒤 전환)
  useEffect(() => {
    if (!data || lock != null) return; // 슬라이드 고정 시 자동전환 안 함
    const dur = SLIDE_DURATIONS[index] ?? INTERVAL_MS;
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, dur);
    return () => clearTimeout(id);
  }, [data, index, lock]);

  // 활성 슬라이드만 재마운트 → 그 화면의 마퀴가 처음부터 흐름 (꺼지는 슬라이드는 그대로)
  useEffect(() => {
    setNonces((prev) => {
      const n = [...prev];
      n[index] = (n[index] ?? 0) + 1;
      return n;
    });
  }, [index]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-[#f7f8f9]">
        <div className="size-12 animate-spin rounded-full border-4 border-[#121212] border-t-transparent" />
        <p className="font-['SUIT:Bold',sans-serif] text-[18px] text-[#21201c]">
          대학로 공연 데이터를 불러오는 중…
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-[#f7f8f9] px-8 text-center">
        <p className="font-['SUIT:Heavy',sans-serif] text-[22px] text-[#21201c]">
          데이터를 불러오지 못했습니다
        </p>
        <p className="max-w-[640px] font-['SUIT:Medium',sans-serif] text-[15px] text-[#7a8397]">
          {error || "KOPIS OpenAPI 응답이 없습니다."}
        </p>
        <p className="font-['SUIT:Medium',sans-serif] text-[13px] text-[#a0a0a0]">
          .env 의 KOPIS_SERVICE_KEY 설정과 네트워크 상태를 확인하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#f7f8f9]">
      {SLIDES.map((Slide, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-start justify-center transition-opacity ease-in-out"
          style={{
            opacity: i === index ? 1 : 0,
            transitionDuration: `${FADE_MS}ms`,
            pointerEvents: i === index ? "auto" : "none",
          }}
        >
          <div
            className="relative shrink-0"
            style={{
              width: DESIGN_WIDTH,
              height: DESIGN_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: "top center",
            }}
          >
            <Slide key={nonces[i]} data={data} />
          </div>
        </div>
      ))}

      {/* 화면 하단 좌우 이동 버튼 (캡쳐/편집 고정모드에서는 숨김) */}
      {lock == null &&
        (navHidden ? (
          // 숨김 상태: 버튼이 있던 자리에 투명 영역 → 더블클릭하면 다시 표시
          <div
            onDoubleClick={() => setNavHidden(false)}
            className="absolute bottom-0 left-1/2 z-50 -translate-x-1/2"
            style={{ width: 320, height: 72, cursor: "default" }}
            title="여기를 더블클릭하면 이동 버튼이 다시 나타납니다"
          />
        ) : (
          <div className="absolute bottom-[20px] left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-[6px] select-none">
            <div className="flex items-center gap-[16px]">
              <button
                onClick={() => goSlide(-1)}
                onDoubleClick={hideNav}
                aria-label="이전 화면"
                className="flex size-[44px] items-center justify-center rounded-full border border-[#d0d3da] bg-white/90 text-[22px] leading-none text-[#21201c] shadow-md transition-colors hover:bg-white"
              >
                ‹
              </button>
              <button
                onClick={() => goSlide(1)}
                onDoubleClick={hideNav}
                aria-label="다음 화면"
                className="flex size-[44px] items-center justify-center rounded-full border border-[#d0d3da] bg-white/90 text-[22px] leading-none text-[#21201c] shadow-md transition-colors hover:bg-white"
              >
                ›
              </button>
            </div>
            <div className="rounded-full bg-black/55 px-[10px] py-[3px] font-['SUIT:Medium',sans-serif] text-[11px] text-white">
              버튼을 더블클릭하면 숨겨지고, 같은 자리를 다시 더블클릭하면 나타납니다
            </div>
          </div>
        ))}
    </div>
  );
}
