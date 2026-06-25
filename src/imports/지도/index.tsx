import { useEffect, useRef, useState } from "react";
import svgPaths from "./svg-i90al120cl";
import { ImageWithFallback } from "../../app/components/figma/ImageWithFallback";
import { TodaySeatsBox } from "../../app/components/TodaySeatsBox";
import { MarqueeText } from "../../app/components/MarqueeText";
import { proxyImg, type DashboardData, type PlayItem } from "../../app/lib/kopis";
import { seasonAccent } from "../../app/lib/season";

// 강조 블록 색(계절별). setAttribute 는 CSS 변수 대신 실제 hex 사용이 안전.
const ACCENT = seasonAccent().accent;

const cleanTitle = (t: string) => t.replace(/\s*\[대학로\]\s*$/, "");
const shortVenue = (v: string) => (v ? v.replace(/\s*\(.*$/, "").trim() || v : "");

// 공연장 이름 → 우리 일러스트 지도(770x528) 위 위치.
// ★ 좌표는 venuePositions.json 에서 관리. 편집모드(?edit=1)에서 핀을 드래그→저장하면 이 파일에 반영됨.
import venuePositionsRaw from "./venuePositions.json";
// todo:true = 내가(어시스턴트) 추측으로 자동 추가한 위치 → 편집모드에서 파란색(검토필요)으로 표시
// lx/ly = 이름표(레이블) 중심의 핀 대비 오프셋(770좌표). 없으면 핀 위 기본 위치.
// synth:true = 실제 지도 블록이 없는(흰 배경) 자리라도 칠함. poly = 그 칸의 외곽선(770좌표) → 도로 선을 따라 칸 모양대로 칠함.
type VenueEntry = { x: number; y: number; todo?: boolean; lx?: number; ly?: number; synth?: boolean; poly?: number[][] };
const VENUE_POS: Record<string, VenueEntry> = venuePositionsRaw as Record<string, VenueEntry>;
const VENUE_POS_ENTRIES = Object.entries(VENUE_POS).map(([k, v]) => [k.replace(/\s+/g, ""), v] as const);

// 공연장명 정규화: 괄호 이전, "구." 제거, 공백 제거
const normVenue = (v: string) =>
  (v || "").split("(")[0].replace(/구\./g, "").replace(/\s+/g, "");

const MARKER_GLIDE = "left 0.7s ease, top 0.7s ease";

// 미등록 공연장 폴백: 대학로 중심 부근에 이름 해시로 약간 분산 (절대 안 빠지게)
function fallbackPos(n: string) {
  let h = 0;
  for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
  return { x: 430 + ((h % 70) - 35), y: 260 + (((h >> 4) % 60) - 30), fallback: true };
}

// 공연장 이름으로 일러스트 위 위치 찾기. 가장 긴 키 우선 매칭(부분일치 충돌 방지). 미등록이면 폴백.
function markerPos(item?: PlayItem) {
  if (!item || !item.venue) return null;
  const n = normVenue(item.venue);
  if (!n) return null;
  // 1) 정확 일치 우선 (굿씨어터 vs 더굿씨어터 같은 충돌 방지)
  for (const [k, v] of VENUE_POS_ENTRIES) if (k === n) return v;
  // 2) 부분 일치 중 가장 긴 키
  let best: { x: number; y: number } | null = null;
  let bestLen = -1;
  for (const [k, v] of VENUE_POS_ENTRIES) {
    if ((n.includes(k) || k.includes(n)) && k.length > bestLen) {
      bestLen = k.length;
      best = v;
    }
  }
  return best ?? fallbackPos(n);
}

// 공연장명으로 좌표표 항목(레이블 오프셋 lx/ly 포함) 찾기 — markerPos와 동일한 매칭.
function venueEntry(venue?: string): VenueEntry | null {
  if (!venue) return null;
  const n = normVenue(venue);
  if (!n) return null;
  for (const [k, v] of VENUE_POS_ENTRIES) if (k === n) return v;
  let best: VenueEntry | null = null;
  let bestLen = -1;
  for (const [k, v] of VENUE_POS_ENTRIES) {
    if ((n.includes(k) || k.includes(n)) && k.length > bestLen) {
      bestLen = k.length;
      best = v;
    }
  }
  return best;
}

// 화면 좌표(sx,sy)를 품은(없으면 가장 가까운) 회색 지도 블럭 path 찾기 — 라이브/편집 공용.
// containingOnly=true 면 "핀이 실제 올라간 블록"만 반환(없으면 null) — 편집 정렬용.
function pickBlock(inner: HTMLElement, sx: number, sy: number, containingOnly = false): Element | null {
  const cRect = inner.getBoundingClientRect();
  if (!cRect.width || !cRect.height) return null;
  const paths = Array.from(inner.querySelectorAll("path")).filter((p) => {
    const f = p.getAttribute("fill") || "";
    return f.includes("#EAEAEA") || f.includes("#D5D5D5");
  });
  let containing: Element | null = null;
  let containingArea = Infinity;
  let nearest: Element | null = null;
  let nearestD = Infinity;
  for (const p of paths) {
    const r = p.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    // 흰 배경/지도 전체급만 제외(한 변 90% 초과). 동성중고 좌우 같은 큰 구획도 칠해지게 함.
    if (r.width > cRect.width * 0.9 || r.height > cRect.height * 0.9) continue;
    if (r.width < cRect.width * 0.03 || r.height < cRect.height * 0.03) continue; // 너무 작은 조각 제외
    if (r.right <= cRect.left || r.left >= cRect.right || r.bottom <= cRect.top || r.top >= cRect.bottom) continue; // 화면 밖
    // 실제 모양 안에 점이 있는지 정밀 판정 (bbox만으로는 부정확)
    let inFill = false;
    try {
      const ctm = (p as SVGGraphicsElement).getScreenCTM();
      if (ctm) inFill = (p as SVGGeometryElement).isPointInFill(new DOMPoint(sx, sy).matrixTransform(ctm.inverse()));
    } catch {
      inFill = sx >= r.left && sx <= r.right && sy >= r.top && sy <= r.bottom;
    }
    if (inFill) {
      const area = r.width * r.height;
      if (area < containingArea) {
        containingArea = area;
        containing = p;
      }
    } else {
      const dx = Math.max(r.left - sx, 0, sx - r.right);
      const dy = Math.max(r.top - sy, 0, sy - r.bottom);
      const d = dx * dx + dy * dy;
      if (d < nearestD) {
        nearestD = d;
        nearest = p;
      }
    }
  }
  return containing ?? (containingOnly ? null : nearest);
}

// 디버그(?allpins=1): 등록된 모든 공연장 위치를 한 번에 점+라벨로 표시 → 위치 검증용
function AllVenueDots() {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none" data-name="AllVenueDots">
      {Object.entries(VENUE_POS).map(([name, p]) => (
        <div key={name} className="absolute" style={{ left: p.x, top: p.y, transform: "translate(-50%,-50%)" }}>
          <div className="size-[8px] rounded-full bg-[#ff2d55] border border-white" style={{ margin: "0 auto" }} />
          <div className="mt-[1px] bg-[#121212] text-white text-[8px] leading-[1.1] px-[3px] py-[1px] rounded-[3px] whitespace-nowrap">{name}</div>
        </div>
      ))}
    </div>
  );
}

// synth:true 공연장 자리를 채우는 계절색 — 도로/구획 레이어 뒤에 깔린다.
// poly(칸 외곽선)가 있으면 그 다각형을 칠해 도로 선을 따라 칸 모양대로 정확히 채운다(선따라 채움).
// poly가 없으면 핀 아래 사각형을 깔고 흰 도로가 위에 덮여 대략적인 칸 모양으로 잘린다.
function SynthBlock({ pos, poly }: { pos: { x: number; y: number }; poly?: number[][] }) {
  if (poly && poly.length >= 3) {
    const points = poly.map(([x, y]) => `${x},${y}`).join(" ");
    return (
      <svg
        className="absolute inset-0 size-full pointer-events-none"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 770 528"
        style={{ transition: MARKER_GLIDE }}
      >
        <polygon points={points} fill="var(--accent)" />
      </svg>
    );
  }
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: pos.x,
        top: pos.y,
        width: 62,
        height: 54,
        transform: "translate(-50%, -50%)",
        background: "var(--accent)",
        transition: MARKER_GLIDE,
      }}
    />
  );
}

// 핀 + 공연장 라벨 — 맨 위 레이어.
// 핀(블록 표시)은 실제 위치 그대로. 라벨만 지도(770x528) 밖으로 안 잘리게 가로 위치를 보정.
function MarkerPin({ item, pos }: { item?: PlayItem; pos: { x: number; y: number } | null }) {
  if (!item || !pos) return null;
  const name = shortVenue(item.venue);
  // 라벨 추정 폭(한글 11px Bold 기준) — 이 폭이 지도 안에 들어오도록 라벨 중심만 클램프
  const labelW = Math.min(170, name.length * 13 + 20);
  const half = labelW / 2;
  const labelCx = Math.max(half + 4, Math.min(770 - half - 4, pos.x));
  // 사용자가 편집모드에서 레이블 위치(lx/ly 오프셋)를 정했으면 그 위치 사용, 아니면 핀 위 기본 위치.
  const entry = venueEntry(item.venue);
  const labelStyle =
    entry && entry.lx != null && entry.ly != null
      ? { left: pos.x + entry.lx, top: pos.y + entry.ly, transform: "translate(-50%, -50%)", transition: MARKER_GLIDE }
      : { left: labelCx, top: pos.y, transform: "translate(-50%, calc(-100% - 39px))", transition: MARKER_GLIDE };
  return (
    <div className="absolute inset-0 z-20 pointer-events-none" data-name="DynamicMarker">
      {/* 라벨: 기본은 핀 위(가로 클램프). 사용자가 정한 오프셋이 있으면 그 위치. */}
      <div
        className="absolute max-w-[170px] overflow-hidden text-ellipsis whitespace-nowrap bg-[#121212] text-white font-['SUIT:Bold',sans-serif] text-[11px] leading-[normal] px-[8px] py-[3px] rounded-[6px]"
        style={labelStyle}
      >
        {name}
      </div>
      {/* 핀: 실제 위치(블록 위) 고정 */}
      <svg
        width="28"
        height="36"
        viewBox="0 0 28 36"
        fill="none"
        className="absolute"
        style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -100%)", transition: MARKER_GLIDE }}
      >
        <path d="M14 35C14 35 25 23 25 13A11 11 0 1 0 3 13C3 23 14 35 14 35Z" fill="#121212" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx="14" cy="13" r="4" fill="#ffffff" />
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute h-[720px] left-0 top-0 w-[117px]">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 117 720">
        <g clipPath="url(#clip0_1_383)" id="Frame 5">
          <rect fill="#121212" height="720" width="117" />
          <path d={svgPaths.p6eeba80} id="Line 1" stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
          <g id="Group 2">
            <path d="M-51 576L192.5 743.5" id="Vector 2" stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
            <g id="Ellipse 5">
              <circle cx="109" cy="687" fill="var(--fill-0, #FFBF6B)" r="12" />
              <circle cx="109" cy="687" r="10.5" stroke="var(--stroke-0, #121212)" strokeOpacity="0.15" strokeWidth="3" />
            </g>
            <g id="Ellipse 8">
              <circle cx="56" cy="650" fill="var(--fill-0, #FFBF6B)" r="12" />
              <circle cx="56" cy="650" r="10.5" stroke="var(--stroke-0, #121212)" strokeOpacity="0.15" strokeWidth="3" />
            </g>
            <g id="Ellipse 7">
              <circle cx="2" cy="611" fill="var(--fill-0, #FFBF6B)" r="12" />
              <circle cx="2" cy="611" r="10.5" stroke="var(--stroke-0, #121212)" strokeOpacity="0.15" strokeWidth="3" />
            </g>
          </g>
          <g id="Group 3">
            <path d="M-78 609L165.5 776.5" id="Vector 2_2" stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
            <g id="Ellipse 5_2">
              <circle cx="82" cy="720" fill="var(--fill-0, #C2FFAA)" r="12" />
              <circle cx="82" cy="720" r="10.5" stroke="var(--stroke-0, #121212)" strokeOpacity="0.15" strokeWidth="3" />
            </g>
            <g id="Ellipse 8_2">
              <circle cx="29" cy="683" fill="var(--fill-0, #C2FFAA)" r="12" />
              <circle cx="29" cy="683" r="10.5" stroke="var(--stroke-0, #121212)" strokeOpacity="0.15" strokeWidth="3" />
            </g>
            <g id="Ellipse 7_2">
              <circle cx="-25" cy="644" fill="var(--fill-0, #C2FFAA)" r="12" />
              <circle cx="-25" cy="644" r="9.5" stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
            </g>
          </g>
          <g id="Ellipse 1">
            <circle cx="56" cy="263" fill="var(--fill-0, #4D4D4D)" r="12" />
            <circle cx="56" cy="263" r="9.5" stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
          </g>
          <g id="Ellipse 2">
            <circle cx="56" cy="175" fill="var(--accent)" r="12" />
            <circle cx="56" cy="175" r="9.5" stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
          </g>
          <g id="Ellipse 3">
            <circle cx="56" cy="351" fill="var(--fill-0, #4D4D4D)" r="12" />
            <circle cx="56" cy="351" r="9.5" stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
          </g>
          <g id="Ellipse 4">
            <circle cx="56" cy="439" fill="var(--fill-0, #4D4D4D)" r="12" />
            <circle cx="56" cy="439" r="9.5" stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
          </g>
          <path d={svgPaths.p2623c00} id="Vector 1" stroke="var(--stroke-0, white)" strokeDasharray="4 4" strokeOpacity="0.9" strokeWidth="3" />
        </g>
        <defs>
          <clipPath id="clip0_1_383">
            <rect fill="white" height="720" width="117" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}


function Section() {
  return (
    <div className="absolute inset-[-11.3%_-1.33%_-4.55%_-21.28%]" data-name="Section">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1186.84 758.773">
        <g id="Section">
          <path d={svgPaths.p6249fa0} fill="var(--fill-0, #D5D5D5)" id="Vector" />
          <path d={svgPaths.p1ca20100} fill="var(--fill-0, #EAEAEA)" id="Vector_2" />
          <path d={svgPaths.p5cd8200} fill="var(--fill-0, #D5D5D5)" id="Vector_3" />
          <path d={svgPaths.p1ee5880} fill="var(--fill-0, #EAEAEA)" id="Vector_4" />
          <path d={svgPaths.p338653f1} fill="var(--fill-0, white)" id="Vector_5" />
          <path d={svgPaths.p33e08400} fill="var(--fill-0, #EAEAEA)" id="Vector_6" />
          <path d={svgPaths.p31316000} fill="var(--fill-0, #EAEAEA)" id="Vector_7" />
          <path d={svgPaths.p11cf400} fill="var(--fill-0, white)" id="Vector_8" />
          <path d={svgPaths.p3262a180} fill="var(--fill-0, #EAEAEA)" id="Vector_9" />
          <path d={svgPaths.p11a27b00} fill="var(--fill-0, #B1FFA3)" id="Vector_10" />
          <path d={svgPaths.p397f3000} fill="var(--fill-0, #EAEAEA)" id="Vector_11" />
          <path d={svgPaths.p7f71e00} fill="var(--fill-0, white)" id="Vector_12" />
          <path d={svgPaths.p25c433c0} fill="var(--fill-0, #EAEAEA)" id="Vector_13" />
          <path d={svgPaths.p112c4500} fill="var(--fill-0, white)" id="Vector_14" />
          <path d={svgPaths.p2907a500} fill="var(--fill-0, #EAEAEA)" id="Vector_15" />
          <path d={svgPaths.p16c80500} fill="var(--fill-0, #EAEAEA)" id="Vector_16" />
          <path d={svgPaths.p46fe500} fill="var(--fill-0, #B1FFA3)" id="Vector_17" />
          <path d={svgPaths.p1a02fc00} fill="var(--fill-0, #EAEAEA)" id="Vector_18" />
          <path d={svgPaths.p12420580} fill="var(--fill-0, #EAEAEA)" id="Vector_19" />
          <path d={svgPaths.p217a04b2} fill="var(--fill-0, #EAEAEA)" id="Vector_20" />
          <path d={svgPaths.p2c610700} fill="var(--fill-0, #FDF340)" id="Vector_21" />
          <path d={svgPaths.p2c06a500} fill="var(--fill-0, #EAEAEA)" id="Vector_22" />
          <path d={svgPaths.p19599c00} fill="var(--fill-0, #EAEAEA)" id="Vector_23" />
          <path d={svgPaths.p3f34f700} fill="var(--fill-0, #EAEAEA)" id="Vector_24" />
          <path d={svgPaths.p23465172} fill="var(--fill-0, #EAEAEA)" id="Rectangle 965" />
          <path d={svgPaths.p39b76000} fill="var(--fill-0, #EAEAEA)" id="Vector_25" />
          <path d={svgPaths.p1be26200} fill="var(--fill-0, #EAEAEA)" id="Vector_26" />
          <path d={svgPaths.p17cdff00} fill="var(--fill-0, #FDF340)" id="Vector_27" />
          <path d={svgPaths.p78e0900} fill="var(--fill-0, #EAEAEA)" id="Vector_28" />
          <path d={svgPaths.p26992400} fill="var(--fill-0, #EAEAEA)" id="Vector_29" />
          <path d={svgPaths.pf6b1b0} fill="var(--fill-0, #EAEAEA)" id="Vector_30" />
          <path d={svgPaths.pa06b180} fill="var(--fill-0, #EAEAEA)" id="Vector_31" />
          <path d={svgPaths.p2d4bc600} fill="var(--fill-0, #EAEAEA)" id="Vector_32" />
          <path d={svgPaths.p172aae80} fill="var(--fill-0, #EAEAEA)" id="Vector_33" />
          <path d={svgPaths.p2efb100} fill="var(--fill-0, white)" id="Vector_34" />
          <path d={svgPaths.p13de9500} fill="var(--fill-0, #EAEAEA)" id="Rectangle 960" />
          <path d={svgPaths.p29113380} fill="var(--fill-0, #EAEAEA)" id="Vector 72" />
          <path d={svgPaths.pa463c00} fill="var(--fill-0, #EAEAEA)" id="Vector 73" />
          <path d={svgPaths.p25c2c500} fill="var(--fill-0, #EAEAEA)" id="Vector 74" />
          <path d={svgPaths.p263e9a00} fill="var(--fill-0, #EAEAEA)" id="Vector 75" />
          <path d={svgPaths.p2d8b3200} fill="var(--fill-0, #EAEAEA)" id="Rectangle 961" />
          <path d={svgPaths.p17bb1400} fill="var(--fill-0, #EAEAEA)" id="Rectangle 962" />
          <path d={svgPaths.p1d27080} fill="var(--fill-0, #EAEAEA)" id="Rectangle 963" />
          <path d={svgPaths.peeb5f00} fill="var(--fill-0, #EAEAEA)" id="Rectangle 964" />
          <ellipse cx="444.01" cy="391" fill="var(--fill-0, #EAEAEA)" id="Ellipse 63" rx="22" ry="20" />
        </g>
      </svg>
    </div>
  );
}

function Map() {
  return (
    <div className="absolute h-[655px] left-[-145px] overflow-clip top-[-10px] w-[968px]" data-name="Map">
      <Section />
    </div>
  );
}

function TdesignLocationFilled() {
  return (
    <div className="-translate-y-1/2 absolute aspect-[24/24] left-[58.04%] overflow-clip right-[39.8%] top-[calc(50%-112.5px)]" data-name="tdesign:location-filled">
      <div className="absolute bottom-[41.67%] left-[33.33%] right-[33.33%] top-1/4">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--accent)" id="Ellipse 64" r="4" />
        </svg>
      </div>
      <div className="absolute inset-[4.16%_12.5%_3.28%_12.5%]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 22.214">
          <path d={svgPaths.pf5b5b00} fill="var(--fill-0, #121212)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Road() {
  return (
    <div className="absolute h-[621px] left-[-218px] overflow-clip top-[-2px] w-[1113px]" data-name="Road">
      <div className="absolute inset-[-2.34%_0_0_0]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1113 635.555">
          <g id="Vector">
            <mask fill="white" id="path-1-inside-1_1_377">
              <path d={svgPaths.p1e575d00} />
            </mask>
            <path d={svgPaths.p1e575d00} mask="url(#path-1-inside-1_1_377)" stroke="var(--stroke-0, black)" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="h-[36.11px] relative w-[86.587px]" data-name="Logo">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 86.5873 36.1101">
        <g id="Logo">
          <path d={svgPaths.p24f99400} fill="var(--fill-0, #121212)" id="Vector" />
          <g id="Letter">
            <path d={svgPaths.p293d7c00} fill="var(--fill-0, #121212)" id="Vector_2" />
            <path d={svgPaths.p28f2b900} fill="var(--fill-0, #121212)" id="Vector_3" />
            <path d={svgPaths.p2f370300} fill="var(--fill-0, #121212)" id="Vector_4" />
            <path d={svgPaths.p1af56df0} fill="var(--fill-0, #121212)" id="Vector_5" />
            <path d={svgPaths.p1ac79b00} fill="var(--fill-0, #121212)" id="Vector_6" />
            <path d={svgPaths.p3b1fa700} fill="var(--fill-0, #121212)" id="Vector_7" />
            <path d={svgPaths.p2d053800} fill="var(--fill-0, #121212)" id="Vector_8" />
            <path d={svgPaths.p3166b900} fill="var(--fill-0, #121212)" id="Vector_9" />
            <path d={svgPaths.p2bc4bb80} fill="var(--fill-0, #121212)" id="Vector_10" />
            <path d={svgPaths.p36ab4900} fill="var(--fill-0, #121212)" id="Vector_11" />
            <path d={svgPaths.p2abffe00} fill="var(--fill-0, #121212)" id="Vector_12" />
            <path d={svgPaths.p32b5c780} fill="var(--fill-0, #121212)" id="Vector_13" />
            <path d={svgPaths.p19068f80} fill="var(--fill-0, #121212)" id="Vector_14" />
            <path d={svgPaths.p97c5d80} fill="var(--fill-0, #121212)" id="Vector_15" />
            <path d={svgPaths.p11af5400} fill="var(--fill-0, #121212)" id="Vector_16" />
            <path d={svgPaths.p2d364a40} fill="var(--fill-0, #121212)" id="Vector_17" />
            <path d={svgPaths.p20faf5f0} fill="var(--fill-0, #121212)" id="Vector_18" />
            <path d={svgPaths.p704c00} fill="var(--fill-0, #121212)" id="Vector_19" />
            <path d={svgPaths.pc221d00} fill="var(--fill-0, #121212)" id="Vector_20" />
            <path d={svgPaths.p13dc4500} fill="var(--fill-0, #121212)" id="Vector_21" />
            <path d={svgPaths.p268a7480} fill="var(--fill-0, #121212)" id="Vector_22" />
            <path d={svgPaths.p1ec9fb00} fill="var(--fill-0, #121212)" id="Vector_23" />
            <path d={svgPaths.p3d8b41e0} fill="var(--fill-0, #121212)" id="Vector_24" />
            <path d={svgPaths.p1df16280} fill="var(--fill-0, #121212)" id="Vector_25" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Station1() {
  return (
    <div className="bg-[#57f5eb] border border-[#121212] border-solid overflow-clip relative size-full" data-name="Station">
      <p className="[word-break:break-word] absolute font-['Gmarket_Sans:Medium',sans-serif] leading-[normal] left-[calc(50%-20.5px)] not-italic text-[14px] text-black top-[4px] whitespace-nowrap">혜화역</p>
    </div>
  );
}

function Exit() {
  return (
    <div className="absolute bg-[#57f5eb] content-stretch flex flex-col inset-[46.02%_50.78%_49.25%_45.97%] items-center justify-center p-[10px] rounded-[999px]" data-name="Exit">
      <div aria-hidden className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] translate-x-[-1px] translate-y-[1.5px] font-['Gmarket_Sans:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[14px] text-black text-center w-full">1</p>
    </div>
  );
}

function Exit1() {
  return (
    <div className="absolute bg-[#57f5eb] content-stretch flex flex-col inset-[42.43%_30.65%_52.84%_66.1%] items-center justify-center p-[10px] rounded-[999px]" data-name="Exit">
      <div aria-hidden className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] translate-x-[-2px] translate-y-[1.5px] font-['Gmarket_Sans:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[14px] text-black text-center w-full">2</p>
    </div>
  );
}

function Exit2() {
  return (
    <div className="absolute bg-[#57f5eb] content-stretch flex flex-col inset-[51.14%_30.13%_44.12%_66.62%] items-center justify-center p-[10px] rounded-[999px]" data-name="Exit">
      <div aria-hidden className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] translate-x-[-2px] translate-y-[2.5px] font-['Gmarket_Sans:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[14px] text-black text-center w-full">3</p>
    </div>
  );
}

function Exit3() {
  return (
    <div className="absolute bg-[#57f5eb] content-stretch flex flex-col inset-[55.49%_56.62%_39.78%_40.13%] items-center justify-center p-[10px] rounded-[999px]" data-name="Exit">
      <div aria-hidden className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] translate-x-[-3px] translate-y-[1.5px] font-['Gmarket_Sans:Medium',sans-serif] leading-none not-italic relative shrink-0 text-[14px] text-black text-center w-full">4</p>
    </div>
  );
}

function Station() {
  return (
    <div className="absolute contents inset-[41.92%_29.52%_37.54%_39.13%]" style={{ containerType: "size" }} data-name="Station">
      <div className="absolute flex h-[49.477px] items-center justify-center left-[326px] top-[278px] w-[91.243px]">
        <div className="flex-none rotate-[-9.19deg]">
          <Logo />
        </div>
      </div>
      <div className="absolute flex inset-[45.84%_31.37%_45.55%_59%] items-center justify-center" style={{ containerType: "size" }}>
        <div className="flex-none h-[hypot(5.49685cqw,83.3975cqh)] rotate-[-6.14deg] w-[hypot(94.5031cqw,-16.6025cqh)]">
          <div className="relative size-full">
            <div className="absolute inset-[-1.31%_-0.71%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 71.5 39.1077">
                <path d={svgPaths.p3bf48b80} fill="var(--fill-0, #57F5EB)" id="Vector 76" stroke="var(--stroke-0, #121212)" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex inset-[48.73%_49.44%_42.67%_40.93%] items-center justify-center" style={{ containerType: "size" }}>
        <div className="-scale-x-100 flex-none h-[hypot(5.49685cqw,83.3975cqh)] rotate-[-6.14deg] w-[hypot(-94.5031cqw,16.6025cqh)]">
          <div className="relative size-full">
            <div className="absolute inset-[-1.31%_-0.71%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 71.5 39.1077">
                <path d={svgPaths.p253e6f0} fill="var(--fill-0, #57F5EB)" id="Vector 77" stroke="var(--stroke-0, #121212)" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex inset-[48.97%_40.42%_45.26%_50.09%] items-center justify-center" style={{ containerType: "size" }}>
        <div className="flex-none h-[hypot(3.36847cqw,75.0649cqh)] rotate-[-6.14deg] w-[hypot(96.6315cqw,-24.9351cqh)]">
          <Station1 />
        </div>
      </div>
      <Exit />
      <Exit1 />
      <Exit2 />
      <Exit3 />
    </div>
  );
}

// 편집 모드(?edit=1): 핀을 드래그해 위치 조정 → "저장"하면 venuePositions.json 에 반영
function EditOverlay({
  innerRef,
  apiVenues,
}: {
  innerRef: { current: HTMLDivElement | null };
  apiVenues: string[];
}) {
  // 확정 좌표(빨강) + 검토필요(파랑: 내가 추측 배치 todo:true, 또는 API에 있으나 테이블 미등록)
  const [pos, setPos] = useState<Record<string, VenueEntry>>(() => {
    const base: Record<string, VenueEntry> = JSON.parse(JSON.stringify(VENUE_POS));
    for (const full of apiVenues || []) {
      const n = normVenue(full);
      if (!n) continue;
      const matched = Object.keys(base).some((k) => {
        const kk = k.replace(/\s+/g, "");
        return kk === n || n.includes(kk) || kk.includes(n);
      });
      if (!matched) {
        const key = shortVenue(full) || n;
        if (!(key in base)) base[key] = { ...fallbackPos(n), todo: true };
      }
    }
    return base;
  });
  const dragging = useRef<string | null>(null);
  const draggingLabel = useRef<string | null>(null); // 레이블(이름표) 드래그 중인 공연장
  const [panelXY, setPanelXY] = useState({ x: 10, y: 10 }); // 편집 패널 위치(770좌표) — 드래그로 이동
  const draggingPanel = useRef<{ dx: number; dy: number } | null>(null);
  // 드래그(선택)한 핀 — 그 아래 블록색 + 레이블 미리보기 대상
  const [activeName, setActiveName] = useState<string | null>(null);
  const editColoredRef = useRef<{ el: Element; fill: string | null } | null>(null);
  const todoCount = Object.values(pos).filter((p) => p.todo).length;
  const [msg, setMsg] = useState(
    todoCount
      ? `검토필요 ${todoCount}곳(파란색)을 드래그해 위치 정하고 저장하세요`
      : "핀 드래그=위치 / 핀 클릭하면 뜨는 이름표 드래그=레이블 위치 → 저장"
  );

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const c = innerRef.current?.getBoundingClientRect();
      if (!c) return;
      const mx = ((e.clientX - c.left) / c.width) * 770;
      const my = ((e.clientY - c.top) / c.height) * 528;
      if (draggingPanel.current) {
        // 패널 이동 (지도 밖으로 너무 안 나가게 살짝 클램프)
        const x = Math.max(-40, Math.min(720, mx - draggingPanel.current.dx));
        const y = Math.max(-10, Math.min(500, my - draggingPanel.current.dy));
        setPanelXY({ x, y });
        return;
      }
      if (draggingLabel.current) {
        // 레이블 이동 → 핀 대비 오프셋(lx/ly) 저장
        const name = draggingLabel.current;
        setPos((p) => {
          const cur = p[name];
          if (!cur) return p;
          return { ...p, [name]: { ...cur, lx: Math.round(mx - cur.x), ly: Math.round(my - cur.y) } };
        });
      } else if (dragging.current) {
        // 핀 이동 (lx/ly 레이블 오프셋은 유지, todo는 해제=확정)
        const name = dragging.current;
        const x = Math.round(Math.max(0, Math.min(770, mx)));
        const y = Math.round(Math.max(0, Math.min(528, my)));
        setPos((p) => {
          const rest = { ...(p[name] ?? {}) };
          delete rest.todo; // 핀 이동 = 확정(파랑→빨강)
          return { ...p, [name]: { ...rest, x, y } };
        });
      }
    };
    const up = () => {
      dragging.current = null;
      draggingLabel.current = null;
      draggingPanel.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [innerRef]);

  // 선택/드래그 중인 핀 아래 지도 블럭을 강조색으로 칠한다 (위치 맞추기용 미리보기).
  useEffect(() => {
    const inner = innerRef.current;
    if (editColoredRef.current) {
      editColoredRef.current.el.setAttribute("fill", editColoredRef.current.fill ?? "");
      editColoredRef.current = null;
    }
    const ap = activeName ? pos[activeName] : null;
    if (!inner || !ap) return;
    const c = inner.getBoundingClientRect();
    if (!c.width || !c.height) return;
    const sx = c.left + (ap.x / 770) * c.width;
    const sy = c.top + (ap.y / 528) * c.height;
    const blk = pickBlock(inner, sx, sy, true); // 편집: 실제 올라간 블록만 칠함
    if (blk) {
      editColoredRef.current = { el: blk, fill: blk.getAttribute("fill") };
      blk.setAttribute("fill", ACCENT);
    }
    return () => {
      if (editColoredRef.current) {
        editColoredRef.current.el.setAttribute("fill", editColoredRef.current.fill ?? "");
        editColoredRef.current = null;
      }
    };
  }, [activeName, activeName ? pos[activeName]?.x : -1, activeName ? pos[activeName]?.y : -1, innerRef]);

  const save = async () => {
    setMsg("저장 중…");
    const json = JSON.stringify(pos, null, 2);
    try {
      const key = new URLSearchParams(window.location.search).get("key") || "";
      const res = await fetch("/api/save-venues" + (key ? `?key=${encodeURIComponent(key)}` : ""), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
      });
      let j: { ok?: boolean; committed?: boolean; note?: string; error?: string } | null = null;
      try {
        j = await res.clone().json();
      } catch {
        j = null;
      }
      if (res.ok && j?.ok) {
        setMsg("저장됨 ✓ " + (j.note || (j.committed ? "GitHub 커밋됨 → 약 1분 뒤 반영" : "반영됨")));
        return;
      }
      // 실패 — 원인을 그대로 보여준다 (404/네트워크일 때만 클립보드 대체)
      navigator.clipboard?.writeText(json);
      if (res.status === 401) {
        setMsg("저장 실패(401): 편집 키가 없거나 틀립니다 — 주소에 ?edit=1&key=◯◯◯ 형태로 키를 붙여 접속하세요. (JSON은 클립보드 복사됨)");
      } else if (res.status === 404) {
        setMsg("저장 실패: 저장 API가 없는 환경입니다 → JSON을 클립보드에 복사했어요. venuePositions.json에 붙여넣으세요.");
      } else {
        setMsg(`저장 실패(${res.status}): ${j?.error || "서버 오류"} → JSON 클립보드 복사됨. (Vercel 환경변수 GITHUB_TOKEN/GITHUB_REPO 확인)`);
      }
    } catch {
      navigator.clipboard?.writeText(json);
      setMsg("저장 실패: 네트워크 오류 → JSON 클립보드 복사됨. venuePositions.json에 붙여넣으세요.");
    }
  };
  const copy = () => {
    navigator.clipboard?.writeText(JSON.stringify(pos, null, 2));
    setMsg("JSON 클립보드 복사됨 — venuePositions.json 에 붙여넣기");
  };

  return (
    <div className="absolute inset-0 z-40" data-name="EditOverlay">
      {Object.entries(pos).map(([name, p]) => {
        const isNew = !!p.todo;
        if (name === activeName) return null; // 선택된 곳은 아래에서 라이브 핀+레이블로 렌더
        return (
          <div
            key={name}
            onPointerDown={(e) => {
              dragging.current = name;
              setActiveName(name); // 잡은 핀 아래 블록색 미리보기
              e.preventDefault();
            }}
            className="absolute flex flex-col items-center select-none"
            style={{
              left: p.x,
              top: p.y,
              transform: "translate(-50%, -50%)",
              cursor: "move",
              touchAction: "none",
              zIndex: isNew ? 45 : 41,
            }}
          >
            <div
              className="rounded-full border-2 border-white"
              style={{ width: isNew ? 16 : 12, height: isNew ? 16 : 12, background: isNew ? "#2d7dff" : "#ff2d55" }}
            />
            <div
              className="text-white text-[9px] leading-[1.1] px-[3px] py-px rounded-[3px] mt-px whitespace-nowrap"
              style={{ background: isNew ? "#2d7dff" : "#121212" }}
            >
              {name}
            </div>
          </div>
        );
      })}
      {/* 선택한 공연장: 라이브와 동일한 핀(teardrop)+이름표 미리보기. 핀/이름표 각각 드래그 */}
      {activeName &&
        pos[activeName] &&
        (() => {
          const p = pos[activeName];
          const labelW = Math.min(170, activeName.length * 13 + 20);
          const half = labelW / 2;
          const cx = Math.max(half + 4, Math.min(770 - half - 4, p.x));
          const lx = p.lx ?? cx - p.x;
          const ly = p.ly ?? -47;
          return (
            <>
              {/* 핀(teardrop) — 드래그 = 위치 */}
              <div
                onPointerDown={(e) => {
                  dragging.current = activeName;
                  e.preventDefault();
                }}
                className="absolute z-[55] cursor-move select-none"
                style={{ left: p.x, top: p.y, transform: "translate(-50%, -100%)", touchAction: "none" }}
              >
                <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
                  <path d="M14 35C14 35 25 23 25 13A11 11 0 1 0 3 13C3 23 14 35 14 35Z" fill="#121212" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="14" cy="13" r="4" fill="#ffffff" />
                </svg>
              </div>
              {/* 이름표 — 드래그 = 레이블 위치 */}
              <div
                onPointerDown={(e) => {
                  draggingLabel.current = activeName;
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="absolute z-[60] cursor-move select-none whitespace-nowrap bg-[#121212] text-white font-['SUIT:Bold',sans-serif] text-[11px] leading-[normal] px-[8px] py-[3px] rounded-[6px]"
                style={{
                  left: p.x + lx,
                  top: p.y + ly,
                  transform: "translate(-50%, -50%)",
                  touchAction: "none",
                  boxShadow: "0 0 0 1.5px var(--accent)",
                }}
              >
                {activeName}
              </div>
            </>
          );
        })()}
      <div
        className="absolute z-50 flex flex-col gap-[6px] rounded-[8px] border-2 border-[#121212] bg-white/95 p-[10px] text-[12px]"
        style={{ left: panelXY.x, top: panelXY.y }}
      >
        <div
          onPointerDown={(e) => {
            const c = innerRef.current?.getBoundingClientRect();
            if (!c) return;
            const mx = ((e.clientX - c.left) / c.width) * 770;
            const my = ((e.clientY - c.top) / c.height) * 528;
            draggingPanel.current = { dx: mx - panelXY.x, dy: my - panelXY.y };
            e.preventDefault();
          }}
          className="cursor-move select-none font-['SUIT:Bold',sans-serif] text-[14px]"
          style={{ touchAction: "none" }}
          title="여기를 드래그해 패널을 옮기세요"
        >
          📍 핀 편집 모드 <span className="text-[10px] text-[#7a8397]">⠿ 드래그</span>
        </div>
        <div className="flex items-center gap-[8px] text-[11px]">
          <span className="flex items-center gap-[3px]"><span className="inline-block size-[10px] rounded-full bg-[#ff2d55]" />확정</span>
          <span className="flex items-center gap-[3px]"><span className="inline-block size-[10px] rounded-full bg-[#2d7dff]" />검토필요 {todoCount}</span>
        </div>
        <div className="flex gap-[6px]">
          <button onClick={save} className="rounded border border-black bg-[var(--accent)] px-[10px] py-[4px] font-bold">
            저장
          </button>
          <button onClick={copy} className="rounded border border-black bg-white px-[10px] py-[4px]">
            JSON 복사
          </button>
        </div>
        <div className="max-w-[200px] text-[#7a8397]">{msg}</div>
      </div>
    </div>
  );
}

function MapStroke({ marker, apiVenues = [] }: { marker?: PlayItem; apiVenues?: string[] }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const coloredRef = useRef<{ el: Element; fill: string | null } | null>(null);
  const [pinPos, setPinPos] = useState<{ x: number; y: number } | null>(null);
  const [synthOn, setSynthOn] = useState(false); // synth:true 공연장이 실제 블록 위가 아니면 핀 아래 블록 그림
  const pos = markerPos(marker);
  let showAllPins = false;
  let showEdit = false;
  try {
    const sp = new URLSearchParams(window.location.search);
    showAllPins = sp.get("allpins") === "1";
    showEdit = sp.get("edit") === "1";
  } catch {
    showAllPins = false;
  }

  // 원래 노란 구획 처리: 서울연극센터(Vector_21)는 기본 강조색으로 칠하고, 나머지는 회색으로.
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    inner.querySelectorAll("path").forEach((p) => {
      if ((p.getAttribute("fill") || "").includes("#FDF340")) {
        p.setAttribute("fill", p.id === "Vector_21" ? ACCENT : "#EAEAEA");
      }
    });
  }, []);

  // 핀은 "저장 위치" 그대로 두고, 그 위치를 품은(또는 가장 가까운) 지도 블럭을 강조색으로 칠한다.
  // → 핀과 강조 블록이 항상 같은 자리(핀 발끝이 그 블록 위)에 있게 됨.
  useEffect(() => {
    const inner = innerRef.current;
    if (coloredRef.current) {
      coloredRef.current.el.setAttribute("fill", coloredRef.current.fill ?? "");
      coloredRef.current = null;
    }
    if (showEdit) {
      // 편집모드에선 라이브 강조를 끄고, EditOverlay가 드래그 핀 아래만 칠한다.
      setPinPos(null);
      setSynthOn(false);
      return;
    }
    if (!inner || !pos) {
      setPinPos(pos ?? null);
      setSynthOn(false);
      return;
    }
    const cRect = inner.getBoundingClientRect();
    if (!cRect.width || !cRect.height) return;
    const sx = cRect.left + (pos.x / 770) * cRect.width;
    const sy = cRect.top + (pos.y / 528) * cRect.height;
    // 핀이 실제 블록 위면 그 블록을 칠함. 블록 밖이어도 synth:true 공연장이면 핀 아래 블록을 그림.
    const chosen = pickBlock(inner, sx, sy, true);
    if (chosen) {
      coloredRef.current = { el: chosen, fill: chosen.getAttribute("fill") };
      chosen.setAttribute("fill", ACCENT);
      setSynthOn(false);
    } else {
      setSynthOn(!!venueEntry(marker?.venue)?.synth);
    }
    setPinPos(pos); // 핀은 항상 저장 위치 (블록 중심으로 점프하지 않음)
    return () => {
      if (coloredRef.current) {
        coloredRef.current.el.setAttribute("fill", coloredRef.current.fill ?? "");
        coloredRef.current = null;
      }
    };
  }, [pos?.x, pos?.y, showEdit]);

  return (
    <div className="h-[528px] relative shrink-0 w-[770px]" data-name="Map_Stroke">
      <div ref={innerRef} className="overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute inset-[-1.7%_-26.88%_-22.35%_-25.53%]" data-name="Background">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1173.6 655">
            <path d={svgPaths.p2c134780} fill="var(--fill-0, white)" id="Background" />
          </svg>
        </div>
        {/* synth 공연장: 배경 위·구획/도로 아래에 깔아 도로로 둘러싸인 칸 모양대로 채움 */}
        {synthOn && pinPos && <SynthBlock pos={pinPos} poly={venueEntry(marker?.venue)?.poly} />}
        <Map />
        <Road />
        <p className="[word-break:break-word] absolute font-['Gmarket_Sans:Medium',sans-serif] inset-[19.89%_82.86%_77.46%_4.29%] leading-[normal] not-italic text-[14px] text-black text-center whitespace-nowrap">동성 중고등학교</p>
        <p className="[word-break:break-word] absolute font-['Gmarket_Sans:Medium',sans-serif] inset-[35.8%_10.52%_61.55%_78.44%] leading-[normal] not-italic text-[14px] text-black text-center whitespace-nowrap">마로니에 공원</p>
        <div className="[word-break:break-word] absolute font-['Gmarket_Sans:Medium',sans-serif] inset-[73.67%_9.09%_19.51%_77.66%] leading-[0] not-italic text-[14px] text-black text-center whitespace-nowrap">
          <p className="leading-[18px] mb-0">서울대학교</p>
          <p className="leading-[18px]">연건캠퍼스/병원</p>
        </div>
        <Station />
        {showEdit ? (
          <EditOverlay innerRef={innerRef} apiVenues={apiVenues} />
        ) : showAllPins ? (
          <AllVenueDots />
        ) : (
          <MarkerPin item={marker} pos={pinPos} />
        )}
      </div>
      <div aria-hidden className="absolute border-3 border-[#121212] border-solid inset-[-3px] pointer-events-none" />
    </div>
  );
}

function Title({ count }: { count: number }) {
  return (
    <div className="relative shrink-0 w-full" data-name="Title">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="[word-break:break-word] content-stretch flex font-['Gmarket_Sans:Medium',sans-serif] gap-[10px] items-center justify-center leading-[normal] not-italic px-[4px] py-[10px] relative size-full text-[#121212]">
          <p className="flex-[1_0_0] min-w-px relative text-[29px]">곧 공연 예정인 연극</p>
          {/* <p className="relative shrink-0 text-[19px] whitespace-nowrap">{count}개</p> */}
        </div>
      </div>
    </div>
  );
}

// 곧 시작할 1행: 회차시각 블록 + 포스터 + 제목/공연장 (+ 강조 행 위치핀)
function UpcomingRow({ item, active }: { item: PlayItem; active?: boolean }) {
  return (
    <div className={`${active ? "bg-[var(--accent)]" : "bg-white"} content-stretch flex items-center py-[2px] relative shrink-0 transition-colors duration-500`} data-name="Time">
      <div aria-hidden className="absolute border-[#121212] border-b border-solid inset-[0_0_-1px_0] pointer-events-none" />
      <div className="flex flex-row items-center self-stretch">
        <div className="h-full relative shrink-0 w-[120px]" data-name="TimBlock">
          <div aria-hidden className="absolute border-[#121212] border-r border-solid inset-0 pointer-events-none" />
          <div className="flex flex-col items-center justify-center size-full">
            <div className="content-stretch flex flex-col gap-[2px] items-center justify-center px-[8px] py-[6px] relative size-full">
              <p className="font-['SUIT:Bold',sans-serif] text-[#121212] text-[17px] text-center whitespace-nowrap">{item.timeRange ?? "-"}</p>
              {item.dayLabel && item.dayLabel !== "오늘" && (
                <p className="font-['SUIT:Medium',sans-serif] text-[#7a8397] text-[12px] text-center whitespace-nowrap">{item.dayLabel}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[8px] items-center px-[10px] py-[8px] relative shrink-0 w-[315px]" data-name="Wrap">
        <div className="h-[56px] relative shrink-0 w-[42px] overflow-hidden">
          <ImageWithFallback alt={item.title} className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={proxyImg(item.poster)} />
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] items-start min-w-px relative whitespace-nowrap">
          <MarqueeText text={cleanTitle(item.title)} className="font-['Elice_DX_Neolli_OTF:Medium',sans-serif] text-[#121212] text-[19px] w-full" />
          <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
            <MarqueeText text={item.venue} className="flex-[1_0_0] font-['SUIT:Medium',sans-serif] min-w-px text-[15px] text-black" />
          </div>
        </div>
        {active && (
          <div className="absolute right-[6px] size-[24px] top-[6px]" data-name="Location">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <rect fill="var(--accent)" height="24" rx="12" width="24" />
              <circle cx="12" cy="10.8" fill="var(--accent)" r="3.6" />
              <path d={svgPaths.p2b416a80} fill="#121212" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

function Wrap1({ items, activeIdx }: { items: PlayItem[]; activeIdx: number }) {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-[435px]" data-name="Wrap">
      <Title count={items.length} />
      <div className="relative rounded-[12px] shrink-0 w-full" data-name="Wrap">
        <div className="content-stretch flex flex-col gap-[3px] items-start overflow-clip relative rounded-[inherit] size-full">
          {items.map((item, i) => (
            <UpcomingRow key={item.mt20id} item={item} active={i === activeIdx} />
          ))}
        </div>
        <div aria-hidden className="absolute border-2 border-[#121212] border-solid inset-0 pointer-events-none rounded-[12px]" />
      </div>
    </div>
  );
}

function Contents({ items, activeIdx, apiVenues }: { items: PlayItem[]; activeIdx: number; apiVenues: string[] }) {
  return (
    <div className="absolute content-stretch flex gap-[33px] items-center left-[159px] top-[145px]" data-name="Contents">
      <MapStroke marker={items[activeIdx]} apiVenues={apiVenues} />
      <Wrap1 items={items} activeIdx={activeIdx} />
    </div>
  );
}

export default function Component({ data }: { data: DashboardData }) {
  // 디버그(?vidx=N): 전체 좌표표 N번째 공연장을 단독으로 강제 표시 (모든 공연장 캡쳐용)
  let dbgItems: PlayItem[] | null = null;
  try {
    const vi = new URLSearchParams(window.location.search).get("vidx");
    if (vi != null) {
      const names = Object.keys(VENUE_POS);
      const n = parseInt(vi, 10);
      if (n >= 0 && n < names.length) {
        dbgItems = [
          { venue: names[n], title: names[n], mt20id: "dbg" + n, poster: "", timeRange: "", dayLabel: "" } as unknown as PlayItem,
        ];
      }
    }
  } catch {
    dbgItems = null;
  }
  // 지도에 위치를 아는(대학로 좌표 테이블에 있는) 공연장만 표시 — 최대 6개
  const mapItems = dbgItems ?? data.upcoming.filter((u) => markerPos(u)).slice(0, 6);
  // 편집모드에서 미등록 표시용: 현재 API가 주는 대학로 공연장 이름 전체(순위+곧공연)
  const apiVenues = [...new Set([...data.top, ...data.upcoming].map((v) => v.venue).filter(Boolean))];
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (mapItems.length <= 1) return;
    // 마지막 핀에서 멈춤(1번으로 되돌지 않음) → 6번째 핀이 전환·페이드 내내 유지됨
    const id = setInterval(() => {
      setTick((t) => {
        if (t >= mapItems.length - 1) {
          clearInterval(id);
          return t;
        }
        return t + 1;
      });
    }, 2800);
    return () => clearInterval(id);
  }, [mapItems.length]);
  // 캡쳐/디버그용: ?pin=N 이면 해당 공연장 고정
  let forcedPin: number | null = null;
  try {
    const v = new URLSearchParams(window.location.search).get("pin");
    forcedPin = v != null ? parseInt(v, 10) : null;
  } catch {
    forcedPin = null;
  }
  const activeIdx =
    forcedPin != null && forcedPin >= 0 && forcedPin < mapItems.length
      ? forcedPin
      : mapItems.length
        ? Math.min(tick, mapItems.length - 1)
        : 0;

  return (
    <div className="bg-[#f7f8f9] relative size-full" data-name="지도">
      <Frame />
      <p className="[word-break:break-word] absolute font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] leading-[normal] left-[159px] not-italic text-[#21201c] text-[40px] top-[20px] whitespace-nowrap">대학로 NOW</p>
      <div className="absolute h-0 left-[137px] top-[104px] w-[1283px]">
        <div className="absolute inset-[-3px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1283 3">
            <line id="Line 3" stroke="var(--stroke-0, black)" strokeWidth="3" x2="1283" y1="1.5" y2="1.5" />
          </svg>
        </div>
      </div>
      <TodaySeatsBox todaySeats={data.todaySeats} deltaPct={data.weekDeltaPct} />
      <Contents items={mapItems} activeIdx={activeIdx} apiVenues={apiVenues} />
    </div>
  );
}