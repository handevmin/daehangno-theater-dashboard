import svgPaths from "./svg-n9g4xv87w2";
import { ImageWithFallback } from "../../app/components/figma/ImageWithFallback";
import { TodaySeatsBox } from "../../app/components/TodaySeatsBox";
import { MarqueeText } from "../../app/components/MarqueeText";
import { proxyImg, fmtNum, type DashboardData, type PlayItem } from "../../app/lib/kopis";

function Frame() {
  return (
    <div className="absolute h-[720px] left-0 top-0 w-[117px]">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 117 720">
        <g clipPath="url(#clip0_4_1047)" id="Frame 5">
          <rect fill="#121212" height="720" width="117" />
          <path d={svgPaths.p6eeba80} id="Line 1" stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
          <g id="Group 2">
            <path d="M-51 576L192.5 743.5" id="Vector 2" stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
            <circle cx="109" cy="687" fill="#FFBF6B" r="12" />
            <circle cx="56" cy="650" fill="#FFBF6B" r="12" />
            <circle cx="2" cy="611" fill="#FFBF6B" r="12" />
          </g>
          <g id="Group 3">
            <path d="M-78 609L165.5 776.5" id="Vector 2_2" stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
            <circle cx="82" cy="720" fill="#C2FFAA" r="12" />
            <circle cx="29" cy="683" fill="#C2FFAA" r="12" />
            <circle cx="-25" cy="644" fill="#C2FFAA" r="12" />
          </g>
          <circle cx="56" cy="175" fill="#4D4D4D" r="12" />
          <circle cx="56" cy="175" r="9.5" stroke="white" strokeOpacity="0.2" strokeWidth="5" />
          <circle cx="56" cy="439" fill="var(--accent)" r="12" />
          <circle cx="56" cy="439" r="9.5" stroke="white" strokeOpacity="0.2" strokeWidth="5" />
          <circle cx="56" cy="351" fill="#4D4D4D" r="12" />
          <circle cx="56" cy="351" r="9.5" stroke="white" strokeOpacity="0.2" strokeWidth="5" />
          <circle cx="56" cy="263" fill="#4D4D4D" r="12" />
          <circle cx="56" cy="263" r="9.5" stroke="white" strokeOpacity="0.2" strokeWidth="5" />
          <circle cx="56" cy="527" fill="#4D4D4D" r="12" />
          <circle cx="56" cy="527" r="9.5" stroke="white" strokeOpacity="0.2" strokeWidth="5" />
          <path d={svgPaths.p38d36000} id="Vector 1" stroke="var(--stroke-0, white)" strokeDasharray="4 4" strokeOpacity="0.9" strokeWidth="3" />
        </g>
        <defs>
          <clipPath id="clip0_4_1047">
            <rect fill="white" height="720" width="117" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Title({ weekLabel }: { weekLabel: string }) {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[3px] items-start not-italic relative shrink-0 text-[#121212] w-[114px] whitespace-nowrap" data-name="Title">
      <p className="font-['SUIT:Bold',sans-serif] leading-[normal] min-w-full overflow-hidden relative shrink-0 text-[15px] text-ellipsis w-[min-content]">{weekLabel}</p>
      <div className="font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] leading-[0] relative shrink-0 text-[29px]">
        <p className="leading-[36px] mb-0">주간 연극</p>
        <p className="leading-[36px]">TOP5</p>
      </div>
    </div>
  );
}

function MingcuteCalendarFill() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 overflow-clip size-[16px] top-1/2" data-name="mingcute:calendar-fill">
      <div className="absolute inset-[12.5%_12.5%_0.78%_12.5%]" data-name="Group">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 13.8767">
          <path d={svgPaths.p27a57530} fill="var(--fill-0, #121212)" id="Vector_2" />
        </svg>
      </div>
    </div>
  );
}

function Wrap3({ weekLabel }: { weekLabel: string }) {
  return (
    <div className="content-stretch flex gap-[2px] items-center py-[2px] relative shrink-0 w-full" data-name="Wrap">
      <div aria-hidden className="absolute border-[#121212] border-b border-solid inset-0 pointer-events-none" />
      <div className="overflow-clip relative rounded-[999px] shrink-0 size-[28px]" data-name="Icon_Calendar">
        <MingcuteCalendarFill />
      </div>
      <p className="[word-break:break-word] font-['SUIT:Bold',sans-serif] leading-[normal] not-italic overflow-hidden relative shrink-0 text-[#121212] text-[13px] text-ellipsis whitespace-nowrap">{weekLabel}</p>
    </div>
  );
}

function Wrap4({ weekTotal }: { weekTotal: number }) {
  return (
    <div className="content-stretch flex gap-[2px] items-center py-[2px] relative shrink-0 w-full" data-name="Wrap">
      <div aria-hidden className="absolute border-[#121212] border-b border-solid inset-0 pointer-events-none" />
      <div className="overflow-clip relative rounded-[999px] shrink-0 size-[28px]" data-name="Icon_Chart">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p8dbfc80} fill="var(--fill-0, black)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['SUIT:Bold',sans-serif] leading-[normal] not-italic overflow-hidden relative shrink-0 text-[#121212] text-[13px] text-ellipsis tracking-[-0.39px] whitespace-nowrap">이번주 총 {fmtNum(weekTotal)}석</p>
    </div>
  );
}

function Wrap1({ weekLabel, weekTotal }: { weekLabel: string; weekTotal: number }) {
  return (
    <div className="content-stretch flex flex-col gap-[146px] items-start relative shrink-0 w-[133px]" data-name="Wrap">
      <Title weekLabel={weekLabel} />
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Wrap">
        <Wrap3 weekLabel={weekLabel} />
        <Wrap4 weekTotal={weekTotal} />
      </div>
    </div>
  );
}

// 카드 1장 (포스터 + 제목 + 순위/장르/연령 태그)
function Card({ item }: { item: PlayItem }) {
  return (
    <div className="content-stretch flex flex-col h-[312px] items-start relative shrink-0 w-[204px]" data-name="Wrap">
      <div aria-hidden className="absolute border border-[#121212] border-solid inset-[-1px] pointer-events-none" />
      <div className="h-[272px] relative shrink-0 w-[204px] overflow-hidden" data-name="image">
        <ImageWithFallback alt={item.title} className="absolute inset-0 max-w-none object-cover object-top pointer-events-none size-full" src={proxyImg(item.poster)} />
      </div>
      <div className="h-[40px] relative shrink-0 w-full" data-name="Title">
        <div aria-hidden className="absolute border-[#121212] border-solid border-t inset-[-0.5px_0_0_0] pointer-events-none" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center px-[8px] py-[10px] relative size-full">
            <MarqueeText text={item.title.replace(/\s*\[대학로\]\s*$/, "")} className="flex-[1_0_0] font-['Gmarket_Sans:Medium',sans-serif] min-w-px text-[#121212] text-[20px]" />
          </div>
        </div>
      </div>
      <div className="absolute content-stretch flex h-[56px] items-start justify-between left-0 px-[4px] py-[8px] top-0 w-[204px]" style={{ background: "linear-gradient(to bottom, rgba(18,18,18,0.9) 0%, rgba(18,18,18,0.55) 45%, rgba(18,18,18,0) 100%)" }} data-name="Title">
        <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
          <div className="content-stretch flex items-center justify-center px-[8px] relative shrink-0" data-name="Rank">
            <p className="[word-break:break-word] font-['SUIT:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">{item.rank}위</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Weekly({ data }: { data: DashboardData }) {
  const top5 = data.top.slice(0, 5);
  return (
    <div className="absolute content-stretch flex items-end justify-between left-[154px] top-[371px] w-[1243px]" data-name="Weekly">
      <Wrap1 weekLabel={data.week.label} weekTotal={data.weekTotalSeats} />
      <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="List">
        {top5.map((item) => (
          <Card key={item.mt20id} item={item} />
        ))}
      </div>
    </div>
  );
}

// 요일별 공연 회차 막대그래프 (대학로 스케줄 기반 — 실제 상연 패턴)
function DayOfWeekChart({ data }: { data: DashboardData }) {
  const days = data.dayShowings;
  const max = Math.max(1, ...days.map((d) => d.count));
  // 축 눈금 (4단계)
  const step = Math.max(1, Math.ceil(max / 4));
  const axis = [4, 3, 2, 1].map((i) => i * step);
  const chartH = 160; // 막대 영역 높이
  const baseTop = 36;
  const peakIdx = days.reduce((bi, d, i, a) => (d.count > a[bi].count ? i : bi), 0); // 최다 상연일 강조
  return (
    <>
    <div className="absolute border-2 border-[#121212] border-solid h-[194px] left-[816px] overflow-clip top-[133px] w-[581px]" data-name="Box">
      <div className="absolute bg-[#121212] h-[194px] left-[-2px] overflow-clip top-[-2px] w-[258px]" data-name="Title">
        <p className="[word-break:break-word] absolute font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] leading-[normal] left-[12px] not-italic text-[26px] text-white top-[12px] whitespace-nowrap">요일별 공연 회차</p>
        <div className="absolute content-stretch flex flex-col gap-[28px] items-end justify-center right-0 top-[21px]" data-name="Wrap">
          {axis.map((v) => (
            <div key={v} className="content-stretch flex gap-[4px] items-center relative shrink-0">
              <p className="font-['SUIT:Bold',sans-serif] text-[11px] text-right text-white tracking-[-0.33px] whitespace-nowrap">{fmtNum(v)}</p>
              <div className="h-px w-[9px] bg-white shrink-0" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute h-[194px] left-[256px] overflow-clip top-[-2px] w-[323px]" data-name="Chart">
        {days.map((d, i) => {
          const h = Math.max(4, (d.count / (step * 4)) * chartH);
          const isToday = i === peakIdx;
          return (
            <div
              key={d.date}
              className="absolute border-2 border-[#121212] border-solid w-[25px]"
              style={{ left: 12 + i * 44, top: baseTop + (chartH - h), height: h, backgroundColor: isToday ? "var(--accent)" : "#e3e2e0" }}
            />
          );
        })}
      </div>
    </div>
    {/* 요일 라벨 — 박스 overflow-clip 밖(아래)에 배치해야 잘리지 않음 */}
    <div className="[word-break:break-word] absolute content-stretch flex font-['SUIT:Bold',sans-serif] gap-[13px] items-center leading-[normal] left-[1085px] not-italic text-[12px] text-black text-center top-[337px] tracking-[-0.36px]">
      {days.map((d) => (
        <p key={d.date} className="relative shrink-0 w-[30px]">{d.day}</p>
      ))}
    </div>
    </>
  );
}

// 주간 공스피 추이 라인차트
function WeeklyTrendChart({ data }: { data: DashboardData }) {
  const pts = data.weeklyTrend;
  const max = Math.max(1, ...pts.map((p) => p.seats));
  const step = Math.ceil(max / 4 / 1000) * 1000;
  const axisMax = step * 4;
  const axis = [4, 3, 2, 1].map((i) => i * step);
  // 플롯 영역: x 24..447 (w423), y 30..112 (h82)
  const plotX0 = 24;
  const plotW = 423;
  const plotY0 = 30;
  const plotH = 82;
  const coords = pts.map((p, i) => {
    const x = plotX0 + (pts.length === 1 ? 0 : (i / (pts.length - 1)) * plotW);
    const y = plotY0 + (1 - p.seats / axisMax) * plotH;
    return { x, y };
  });
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const last = coords[coords.length - 1];
  return (
    <>
    <div className="absolute border-2 border-[#121212] border-solid h-[194px] left-[154px] overflow-clip top-[133px] w-[640px]" data-name="Box">
      <div className="absolute bg-[#121212] h-[194px] left-[-2px] overflow-clip top-[-2px] w-[226px]" data-name="Title">
        <p className="[word-break:break-word] absolute font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] leading-[normal] left-[12px] not-italic text-[26px] text-white top-[12px] whitespace-nowrap">주간 공스피</p>
        <div className="absolute content-stretch flex flex-col gap-[28px] items-end justify-center right-0 top-[21px]" data-name="Wrap">
          {axis.map((v) => (
            <div key={v} className="content-stretch flex gap-[4px] items-center relative shrink-0">
              <p className="font-['SUIT:Bold',sans-serif] text-[11px] text-right text-white tracking-[-0.33px] whitespace-nowrap">{fmtNum(v)}</p>
              <div className="h-px w-[9px] bg-white shrink-0" />
            </div>
          ))}
        </div>
        <div className="absolute bottom-[123px] content-stretch flex gap-[7px] items-center left-[15px]" data-name="Wrap">
          <p className="font-['SUIT:SemiBold',sans-serif] text-[14px] text-white tracking-[-0.28px] whitespace-nowrap">지난주 대비</p>
          <div className="content-stretch flex gap-px items-center relative shrink-0">
            <p className="font-['SUIT:ExtraBold',sans-serif] text-[14px] whitespace-nowrap" style={{ color: data.weekDeltaPct >= 0 ? "#10cf72" : "#ff8173" }}>
              {data.weekDeltaPct >= 0 ? "▲" : "▼"} {Math.abs(data.weekDeltaPct)}%
            </p>
          </div>
        </div>
      </div>
      <div className="absolute h-[194px] left-[224px] overflow-clip top-[-2px] w-[414px]" data-name="Chart">
        <div className="absolute h-[126px] left-0 top-[28px] w-[414px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 464 127">
            <line stroke="#121212" strokeDasharray="2 2" strokeOpacity="0.2" x2="464" y1="0.5" y2="0.5" />
            <line stroke="#121212" strokeDasharray="2 2" strokeOpacity="0.2" x2="464" y1="42.5" y2="42.5" />
            <line stroke="#121212" strokeDasharray="2 2" strokeOpacity="0.2" x2="464" y1="84.5" y2="84.5" />
            <line stroke="#121212" strokeDasharray="2 2" strokeOpacity="0.2" x2="464" y1="126.5" y2="126.5" />
          </svg>
        </div>
        <div className="absolute h-[194px] left-0 top-0 w-[414px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 464 194">
            <path d={path} stroke="black" strokeWidth="2" fill="none" />
            {coords.map((c, i) => (
              <circle key={i} cx={c.x} cy={c.y} r="6" fill={i === coords.length - 1 ? "var(--accent)" : "#E3E2E0"} stroke="#121212" strokeWidth="2" />
            ))}
          </svg>
        </div>
        {last && (
          <p className="[word-break:break-word] absolute font-['SUIT:Bold',sans-serif] leading-[normal] not-italic text-[12px] text-black text-right tracking-[-0.36px] whitespace-nowrap" style={{ left: Math.min(last.x + 14, 460), top: last.y - 30, transform: "translateX(-100%)" }}>
            {fmtNum(pts[pts.length - 1].seats)}석
          </p>
        )}
      </div>
    </div>
    {/* x축 주차 라벨 — 박스 overflow-clip 밖(아래)에 배치해야 잘리지 않음 (피그마와 동일) */}
    <div className="[word-break:break-word] absolute content-stretch flex font-['SUIT:Bold',sans-serif] items-center justify-between leading-[normal] left-[402px] not-italic text-[12px] text-black text-center top-[337px] tracking-[-0.36px] w-[375px]">
      {pts.map((p, i) => (
        <p key={i} className="relative shrink-0 whitespace-nowrap">{p.label}</p>
      ))}
    </div>
    </>
  );
}

export default function Component({ data }: { data: DashboardData }) {
  return (
    <div className="bg-[#f7f8f9] relative size-full" data-name="대시보드">
      <p className="[word-break:break-word] absolute font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] leading-[normal] left-[159px] not-italic text-[#21201c] text-[40px] top-[20px] whitespace-nowrap">주간 연극 소비 데이터</p>
      <div className="absolute h-0 left-[137px] top-[104px] w-[1283px]">
        <div className="absolute inset-[-3px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1283 3">
            <line stroke="black" strokeWidth="3" x2="1283" y1="1.5" y2="1.5" />
          </svg>
        </div>
      </div>
      <TodaySeatsBox todaySeats={data.todaySeats} deltaPct={data.weekDeltaPct} />
      <Frame />
      <Weekly data={data} />
      <WeeklyTrendChart data={data} />
      <DayOfWeekChart data={data} />
    </div>
  );
}
