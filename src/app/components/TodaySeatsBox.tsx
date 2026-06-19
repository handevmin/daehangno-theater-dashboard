import svgPaths from "../../imports/대시보드/svg-n9g4xv87w2";
import { fmtNum } from "../lib/kopis";

// 화면 상단의 작은 세로 bar 2개 (원본 디자인 — 박스 위 1110px / 1320px 지점)
function TopBars() {
  return (
    <>
      <div className="absolute flex h-[16px] items-center justify-center left-[1110px] top-0 w-0">
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[16px]">
            <div className="absolute inset-[-3px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 3">
                <line stroke="#121212" strokeWidth="3" x2="16" y1="1.5" y2="1.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex h-[16px] items-center justify-center left-[1320px] top-0 w-0">
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[16px]">
            <div className="absolute inset-[-3px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 3">
                <line stroke="#121212" strokeWidth="3" x2="16" y1="1.5" y2="1.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// "오늘의 공스피" 우측 상단 박스 — 4개 화면 공용 (위치/너비 일관성 보장)
export function TodaySeatsBox({ todaySeats, deltaPct }: { todaySeats: number; deltaPct: number }) {
  const up = deltaPct >= 0;
  const color = up ? "#10cf72" : "#ff8173";
  return (
    <>
      <TopBars />
      <div className="absolute content-stretch flex gap-[20px] items-center px-[30px] py-[16px] right-[27px] rounded-[999px] top-[20px]" data-name="Box">
        <div aria-hidden className="absolute border-3 border-black border-solid inset-0 pointer-events-none rounded-[999px]" />
        <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 text-[#21201c] whitespace-nowrap">
          <p className="font-['SUIT:Bold',sans-serif] text-[20px]">오늘의 공스피</p>
          <p className="font-['SUIT:Heavy',sans-serif] text-[24px]">{fmtNum(todaySeats)}석</p>
        </div>
        <div className="flex h-[25px] items-center justify-center relative shrink-0 w-0">
          <div className="flex-none rotate-90">
            <div className="h-0 relative w-[25px]">
              <div className="absolute inset-[-1px_0_0_0]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 1">
                  <line stroke="black" x2="25" y1="0.5" y2="0.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
          {/* 증감 삼각형 — 원본 Figma 형태 (상승=초록 위, 하락=빨강 아래) */}
          <div className="h-[24px] relative shrink-0 w-[30px]">
            <div
              className="absolute h-[17px] left-1/2 top-[6px] w-[26px]"
              style={{ transform: up ? "translateX(-50%)" : "translateX(-50%) rotate(180deg)" }}
            >
              <div className="absolute bottom-1/4 left-[6.7%] right-[6.7%] top-0">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.5167 12.75">
                  <path d={svgPaths.p3e345600} fill={color} />
                </svg>
              </div>
            </div>
          </div>
          <p className="font-['SUIT:ExtraBold',sans-serif] text-[20px] whitespace-nowrap" style={{ color }}>
            {Math.abs(deltaPct)}%
          </p>
        </div>
      </div>
    </>
  );
}
