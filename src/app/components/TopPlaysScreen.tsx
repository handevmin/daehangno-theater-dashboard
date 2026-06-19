// 대학로 연극 TOP 리스트 + 피처 카드 화면 (연극1~5 / 연극6~10 공용)
import { useEffect, useState } from "react";
import svgPaths from "../../imports/연극15/svg-5b31ws4kwr";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { QRCode } from "./QRCode";
import { TodaySeatsBox } from "./TodaySeatsBox";
import { MarqueeText } from "./MarqueeText";
import { proxyImg, type DashboardData, type PlayItem } from "../lib/kopis";

const cleanTitle = (t: string) => t.replace(/\s*\[대학로\]\s*$/, "");
const fmtPeriod = (a: string, b: string) => (a && b ? `${a} ~ ${b}` : a || b || "");

// 피처 카드 전환용 페이드인 키프레임 1회 주입
let fadeInjected = false;
function ensureFadeKeyframes() {
  if (fadeInjected || typeof document === "undefined") return;
  fadeInjected = true;
  const style = document.createElement("style");
  style.textContent =
    "@keyframes kopis-featured-in{from{opacity:0}to{opacity:1}}";
  document.head.appendChild(style);
}

function Frame() {
  return (
    <div className="absolute h-[720px] left-0 top-0 w-[117px]">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 117 720">
        <g clipPath="url(#clip_topplays)">
          <rect fill="#121212" height="720" width="117" />
          <path d={svgPaths.p6eeba80} stroke="white" strokeOpacity="0.2" strokeWidth="5" />
          <g>
            <path d="M-51 576L192.5 743.5" stroke="white" strokeOpacity="0.2" strokeWidth="5" />
            <circle cx="109" cy="687" fill="#FFBF6B" r="12" />
            <circle cx="56" cy="650" fill="#FFBF6B" r="12" />
            <circle cx="2" cy="611" fill="#FFBF6B" r="12" />
          </g>
          <g>
            <path d="M-78 609L165.5 776.5" stroke="white" strokeOpacity="0.2" strokeWidth="5" />
            <circle cx="82" cy="720" fill="#C2FFAA" r="12" />
            <circle cx="29" cy="683" fill="#C2FFAA" r="12" />
            <circle cx="-25" cy="644" fill="#C2FFAA" r="12" />
          </g>
          <circle cx="56" cy="175" fill="#4D4D4D" r="12" />
          <circle cx="56" cy="263" fill="var(--accent)" r="12" />
          <circle cx="56" cy="351" fill="#4D4D4D" r="12" />
          <circle cx="56" cy="439" fill="#4D4D4D" r="12" />
          <path d={svgPaths.paaa8180} stroke="white" strokeDasharray="4 4" strokeOpacity="0.9" strokeWidth="3" />
        </g>
        <defs>
          <clipPath id="clip_topplays"><rect fill="white" height="720" width="117" /></clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Sep() {
  return (
    <div className="flex h-[10px] items-center justify-center relative shrink-0 w-0">
      <div className="flex-none rotate-90"><div className="h-0 relative w-[10px]"><div className="absolute inset-[-1px_0_0_0]"><svg className="block size-full" viewBox="0 0 10 1"><line stroke="#121212" x2="10" y1="0.5" y2="0.5" /></svg></div></div></div>
    </div>
  );
}

function Row({ item, active }: { item: PlayItem; active?: boolean }) {
  const times = item.times.slice(0, 2);
  return (
    <div className="content-stretch flex gap-[13px] items-end pb-[14px] relative shrink-0 w-full">
      <div aria-hidden className="absolute border-[#121212] border-b border-solid inset-[0_0_-1px_0] pointer-events-none" />
      <div className="content-stretch flex flex-col items-center justify-center px-[2px] relative shrink-0 w-[35px]">
        <p className="font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] text-[20px] text-black text-center whitespace-nowrap">{item.rank}</p>
      </div>
      <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[487px]">
        <div className="h-[74px] relative shrink-0 w-[56px] overflow-hidden">
          <ImageWithFallback alt={item.title} className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={proxyImg(item.poster)} />
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col h-[74px] items-start justify-between min-w-px relative">
          <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full">
            <div className="content-stretch flex flex-[1_0_0] items-center min-w-px relative">
              <MarqueeText text={cleanTitle(item.title)} className="flex-[1_0_0] font-['Elice_DX_Neolli_OTF:Medium',sans-serif] min-w-px text-[#121212] text-[19px]" />
            </div>
            <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
              {times.map((t) => (
                <div key={t} className="bg-white content-stretch flex flex-col items-center justify-center px-[10px] py-[6px] relative rounded-[4px] shrink-0 w-[70px]">
                  <div aria-hidden className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[4px]" />
                  <p className="font-['SUIT:ExtraBold',sans-serif] text-[#121212] text-[15px] text-center">{t}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-[390px]">
            <MarqueeText text={item.venue} className="font-['SUIT:Medium',sans-serif] max-w-[220px] text-[15px] text-black" />
            {item.ageNum && (<><Sep /><p className="font-['SUIT:Medium',sans-serif] overflow-hidden text-[15px] text-black text-ellipsis whitespace-nowrap">{item.ageNum === "전체" ? "전체" : `${item.ageNum}세`}</p></>)}
          </div>
        </div>
      </div>
      <div className={`-translate-x-1/2 absolute bg-[var(--accent)] bottom-0 h-[6px] left-1/2 w-[535px] transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0"}`} />
    </div>
  );
}

function Actors({ cast }: { cast: string[] }) {
  // 한 줄에 동그라미 7개까지 들어감. 7명 이하면 전부 표시, 8명 이상일 때만 6명 + "그 외 +N"
  const MAX = 7;
  const shown = cast.length <= MAX ? cast : cast.slice(0, MAX - 1);
  const rest = cast.length - shown.length;
  return (
    <div className="content-stretch flex gap-[5px] items-center p-[15px] relative shrink-0 w-full">
      {shown.map((name, i) => (
        <div key={i} className="content-stretch flex flex-col gap-px items-center relative shrink-0 w-[32px]">
          <div className="size-[32px] relative rounded-[888px] bg-[#e3e2e0] flex items-center justify-center overflow-hidden">
            <span className="font-['SUIT:Bold',sans-serif] text-[13px] text-[#121212]">{name.slice(0, 1)}</span>
            <div aria-hidden className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[888px]" />
          </div>
          <p className="font-['SUIT:Medium',sans-serif] text-[#121212] text-[10px] tracking-[-0.4px] whitespace-nowrap">{name.length > 4 ? name.slice(0, 3) + "…" : name}</p>
        </div>
      ))}
      {rest > 0 && (
        <div className="content-stretch flex flex-col gap-px items-center relative shrink-0 w-[32px]">
          <div className="size-[32px] relative rounded-[888px] bg-[rgba(18,18,18,0.2)] flex items-center justify-center">
            <span className="font-['SUIT:Bold',sans-serif] text-[12px] text-[var(--accent)]">+{rest}</span>
            <div aria-hidden className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[888px]" />
          </div>
          <p className="font-['SUIT:Medium',sans-serif] text-[#121212] text-[10px] tracking-[-0.4px] whitespace-nowrap">그 외</p>
        </div>
      )}
    </div>
  );
}

function IconLocation() {
  return (
    <div className="overflow-clip relative rounded-[699.3px] shrink-0 size-[24px]">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16"><path d={svgPaths.p4c28b00} fill="#121212" /></svg>
      </div>
    </div>
  );
}

function IconCalendar() {
  return (
    <div className="overflow-clip relative rounded-[699.3px] shrink-0 size-[24px]">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 overflow-clip size-[16.8px] top-1/2">
        <div className="absolute inset-[12.5%_12.5%_0.77%_12.5%]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.6 14.5705"><path d={svgPaths.p9916500} fill="#121212" /></svg>
        </div>
      </div>
    </div>
  );
}

function Featured({ item, badge, fadeIn }: { item: PlayItem; badge: string; fadeIn?: boolean }) {
  const intro =
    item.intro ||
    `${item.cast.slice(0, 3).join(", ")}${item.cast.length ? " 출연. " : ""}${item.venue}에서 만나는 연극${item.runtime ? ` · 러닝타임 ${item.runtime}` : ""}.`;
  const reserveUrl = item.reservations[0]?.url || "";
  const times = item.times.slice(0, 2);
  return (
    <div
      className="absolute content-stretch flex flex-col items-start left-[739px] top-[158px] w-[661px]"
      style={fadeIn ? { animation: "kopis-featured-in 0.6s ease both" } : undefined}
    >
      <div className="content-stretch flex gap-[3px] items-center relative shrink-0 w-full">
        <div className="content-stretch flex items-center relative shrink-0">
          <div aria-hidden className="absolute border-3 border-[#121212] border-solid inset-[-3px] pointer-events-none" />
          <div className="h-[502px] relative shrink-0 w-[376px] overflow-hidden">
            <ImageWithFallback alt={item.title} className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={proxyImg(item.poster)} />
          </div>
        </div>
        <div className="bg-[#f7f8f9] content-stretch flex flex-col h-[502px] items-start justify-between relative shrink-0 w-[282px]">
          <div aria-hidden className="absolute border-3 border-[#121212] border-solid inset-[-3px] pointer-events-none" />
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
            <div className="bg-[#121212] relative shrink-0 w-full">
              <div className="content-stretch flex flex-col gap-[19px] items-end px-[14px] py-[20px] relative w-full">
                <div className="content-stretch flex gap-[9px] items-start relative shrink-0">
                  {reserveUrl && (
                    <div className="bg-[var(--accent)] content-stretch flex items-center justify-center px-[12px] py-[6px] relative rounded-[999px] shrink-0 h-[48px]">
                      <div aria-hidden className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[999px]" />
                      <p className="font-['SUIT:Bold',sans-serif] text-[14px] text-black whitespace-nowrap">예약 페이지로</p>
                    </div>
                  )}
                  {reserveUrl && (
                    <div className="relative shrink-0 size-[48px] bg-white p-[2px] rounded-[2px]">
                      <QRCode value={reserveUrl} size={44} />
                    </div>
                  )}
                </div>
                <div className="content-stretch flex flex-col gap-[5px] items-start relative shrink-0 w-full">
                  <p className="flex-[1_0_0] font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] overflow-hidden text-[27px] text-ellipsis text-white w-full whitespace-nowrap">{cleanTitle(item.title)}</p>
                  <p className="font-['SUIT:Medium',sans-serif] h-[54px] leading-[1.5] overflow-hidden text-[12px] text-ellipsis text-white w-full">{intro}</p>
                </div>
              </div>
            </div>
            <Actors cast={item.cast} />
          </div>
          <div className="content-stretch flex flex-col gap-[16px] items-start p-[15px] relative shrink-0 w-full">
            {times.length > 0 && (
              <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
                {item.dayLabel && (
                  <p className="font-['SUIT:Bold',sans-serif] text-[#121212] text-[13px] whitespace-nowrap">{item.dayLabel}</p>
                )}
                {times.map((t) => (
                  <div key={t} className="bg-white content-stretch flex flex-col gap-[2px] items-center justify-center px-[10px] py-[6px] relative rounded-[4px] shrink-0 w-[80px]">
                    <div aria-hidden className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[4px]" />
                    <p className="font-['SUIT:ExtraBold',sans-serif] text-[#121212] text-[15px] text-center">{t}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-full gap-[6px]">
              <div className="content-stretch flex gap-[6px] items-center pr-[4px] relative w-full">
                <IconLocation />
                <MarqueeText text={item.venue} className="flex-[1_0_0] font-['SUIT:Medium',sans-serif] min-w-px text-[15px] text-black" />
              </div>
              <div className="content-stretch flex gap-[6px] items-center pr-[4px] relative w-full">
                <IconCalendar />
                <p className="font-['SUIT:Medium',sans-serif] overflow-hidden text-[#121212] text-[15px] text-ellipsis whitespace-nowrap">{fmtPeriod(item.periodFrom, item.periodTo)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute left-[-40px] size-[100px] top-[-40px]">
        <div className="absolute left-0 size-[100px] top-0">
          <div className="absolute inset-[0_0.76%_3.02%_0.76%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 98.4808 96.9846"><path d={svgPaths.p2df59f00} fill="var(--accent)" stroke="black" strokeWidth="3" /></svg>
          </div>
        </div>
        <p className="-translate-x-1/2 absolute font-['SUIT:ExtraBold',sans-serif] left-[calc(50%+0.5px)] text-[#121212] text-[28px] text-center top-[calc(50%-17px)] whitespace-nowrap">{badge}</p>
      </div>
    </div>
  );
}

export function TopPlaysScreen({
  data,
  start,
  count,
  title,
}: {
  data: DashboardData;
  start: number; // 0-based 시작 인덱스
  count: number;
  title: string;
}) {
  const items = data.top.slice(start, start + count);
  // 항목을 하나씩 순환 강조(2.8초 간격), 마지막 항목에서 멈춤 → 지도 핀과 동일한 방식
  const [tick, setTick] = useState(0);
  useEffect(() => {
    ensureFadeKeyframes();
  }, []);
  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => {
      setTick((t) => {
        if (t >= items.length - 1) {
          clearInterval(id);
          return t;
        }
        return t + 1;
      });
    }, 2800);
    return () => clearInterval(id);
  }, [items.length]);
  const activeIdx = items.length ? Math.min(tick, items.length - 1) : 0;
  const featured = items[activeIdx];
  // 크로스페이드: 이전 카드를 아래 깔고 새 카드를 위에서 페이드인 (배경 깜빡임 방지)
  const [layers, setLayers] = useState<{ cur?: PlayItem; prev?: PlayItem; nonce: number }>({
    cur: featured,
    nonce: 0,
  });
  useEffect(() => {
    setLayers((s) =>
      s.cur?.mt20id === featured?.mt20id ? s : { cur: featured, prev: s.cur, nonce: s.nonce + 1 }
    );
  }, [featured?.mt20id]);
  return (
    <div className="bg-[#f7f8f9] relative size-full">
      <Frame />
      <p className="[word-break:break-word] absolute font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] leading-[normal] left-[159px] not-italic text-[#21201c] text-[40px] top-[20px] whitespace-nowrap">{title}</p>
      <div className="absolute h-0 left-[137px] top-[104px] w-[1283px]">
        <div className="absolute inset-[-3px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1283 3"><line stroke="black" strokeWidth="3" x2="1283" y1="1.5" y2="1.5" /></svg>
        </div>
      </div>
      <TodaySeatsBox todaySeats={data.todaySeats} deltaPct={data.weekDeltaPct} />
      <div className="absolute content-stretch flex flex-col gap-[20px] items-start left-[157px] top-[140px] w-[535px]">
        {items.map((item, i) => (
          <Row key={item.mt20id} item={item} active={i === activeIdx} />
        ))}
      </div>
      {layers.prev && layers.prev.mt20id !== layers.cur?.mt20id && (
        <Featured item={layers.prev} badge={`${layers.prev.rank}위`} />
      )}
      {layers.cur && (
        <Featured key={layers.nonce} item={layers.cur} badge={`${layers.cur.rank}위`} fadeIn={layers.nonce > 0} />
      )}
    </div>
  );
}
