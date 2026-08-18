// 관리자 페이지 — 누적 소개 연극 집계 (인사이트 대시보드).
//  - 공스피(대시보드)에 소개된 연극 누적 + 극캐감별사 추천 공연 누적
//  - KPI 타일 + 월별 추이 차트 + 인사이트. /api/seen-stat(KV) 기반.
import { useEffect, useMemo, useState } from "react";

const GOLD = "#efba12";
const BLUE = "#4b93e6";

interface SeenNs {
  configured: boolean;
  total: number;
  byMonth: Record<string, number>;
}
interface SeenStat {
  configured: boolean;
  dashboard: SeenNs;
  quiz: SeenNs;
}

const monthLabel = (m: string) => {
  const [y, mm] = m.split("-");
  return `${y.slice(2)}.${mm}`;
};
const monthLabelFull = (m: string) => {
  const [y, mm] = m.split("-");
  return `${y}년 ${Number(mm)}월`;
};

function derive(ns: SeenNs) {
  const months = Object.keys(ns.byMonth).sort();
  const vals = months.map((m) => ns.byMonth[m]);
  const cur = vals.length ? vals[vals.length - 1] : 0;
  const prev = vals.length > 1 ? vals[vals.length - 2] : null;
  const avg = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0;
  let peak = "";
  for (const m of months) if (peak === "" || ns.byMonth[m] > ns.byMonth[peak]) peak = m;
  return { months, cur, prev, delta: prev == null ? null : cur - prev, avg, peak };
}

/* ── KPI 타일 ── */
function Tile({
  label,
  value,
  accent,
  sub,
  unit = "편",
}: {
  label: string;
  value: number;
  accent: string;
  sub: React.ReactNode;
  unit?: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8ebef",
        borderRadius: 16,
        padding: "18px 20px",
        boxShadow: "0 6px 20px -12px rgba(0,0,0,0.18)",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 700, color: "#5b616b" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 12 }}>
        <span style={{ fontSize: 44, fontWeight: 800, color: accent, lineHeight: 1, letterSpacing: -1 }}>
          {value.toLocaleString()}
        </span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#8a8f98" }}>{unit}</span>
      </div>
      <div style={{ marginTop: 10, fontSize: 12.5, color: "#7a808a" }}>{sub}</div>
    </div>
  );
}

function DeltaChip({ delta }: { delta: number | null }) {
  if (delta == null) return <span style={{ color: "#aaa" }}>첫 집계 달</span>;
  if (delta === 0) return <span style={{ color: "#999" }}>전월과 동일</span>;
  const up = delta > 0;
  return (
    <span style={{ color: up ? "#e0663a" : "#2f9e6f", fontWeight: 700 }}>
      전월 대비 {up ? "▲" : "▼"} {Math.abs(delta)}편
    </span>
  );
}

/* ── 월별 추이 그룹 막대 차트 (SVG) ── */
function TrendChart({ dash, quiz }: { dash: SeenNs; quiz: SeenNs }) {
  const months = useMemo(() => {
    const set = new Set([...Object.keys(dash.byMonth), ...Object.keys(quiz.byMonth)]);
    return Array.from(set).sort().slice(-12);
  }, [dash, quiz]);

  const W = 760;
  const H = 260;
  const padL = 34;
  const padR = 12;
  const padT = 22;
  const padB = 34;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const max = Math.max(1, ...months.map((m) => Math.max(dash.byMonth[m] || 0, quiz.byMonth[m] || 0)));
  const yTicks = 4;
  const groupW = months.length ? innerW / months.length : innerW;
  const barW = Math.min(26, (groupW - 14) / 2);

  const y = (v: number) => padT + innerH - (v / max) * innerH;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 520, display: "block" }}>
        {/* 그리드 + Y 라벨 */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const v = Math.round((max / yTicks) * i);
          const yy = y(v);
          return (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke="#eef0f2" strokeWidth={1} />
              <text x={padL - 8} y={yy + 4} textAnchor="end" fontSize={10} fill="#b3b8bf">
                {v}
              </text>
            </g>
          );
        })}
        {months.map((m, i) => {
          const gx = padL + groupW * i + groupW / 2;
          const dv = dash.byMonth[m] || 0;
          const qv = quiz.byMonth[m] || 0;
          const bx1 = gx - barW - 3;
          const bx2 = gx + 3;
          return (
            <g key={m}>
              {/* 공스피 */}
              <rect x={bx1} y={y(dv)} width={barW} height={padT + innerH - y(dv)} rx={5} fill={GOLD} />
              {dv > 0 && (
                <text x={bx1 + barW / 2} y={y(dv) - 5} textAnchor="middle" fontSize={10} fontWeight={700} fill="#a8790a">
                  {dv}
                </text>
              )}
              {/* 극캐 */}
              <rect x={bx2} y={y(qv)} width={barW} height={padT + innerH - y(qv)} rx={5} fill={BLUE} />
              {qv > 0 && (
                <text x={bx2 + barW / 2} y={y(qv) - 5} textAnchor="middle" fontSize={10} fontWeight={700} fill="#2f6bb0">
                  {qv}
                </text>
              )}
              <text x={gx} y={H - 12} textAnchor="middle" fontSize={11} fontWeight={600} fill="#6b7079">
                {monthLabel(m)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function SeenStatsView() {
  const [stat, setStat] = useState<SeenStat | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setErr("");
    fetch("/api/seen-stat", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setStat(j))
      .catch((e) => setErr(String(e?.message || e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const dashD = stat ? derive(stat.dashboard) : null;
  const quizD = stat ? derive(stat.quiz) : null;
  const periodMonths = stat
    ? new Set([...Object.keys(stat.dashboard.byMonth), ...Object.keys(stat.quiz.byMonth)]).size
    : 0;

  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #e8ebef",
    borderRadius: 16,
    boxShadow: "0 6px 20px -12px rgba(0,0,0,0.15)",
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "4px 24px 60px", fontFamily: "'SUIT', sans-serif", color: "#1c1f24" }}>
      {/* 헤더: 제목 좌 / 새로고침 우 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "2px 0 18px" }}>
        <div>
          <h2 style={{ fontSize: 20, margin: 0, letterSpacing: -0.3 }}>누적 소개 연극 인사이트</h2>
          <p style={{ fontSize: 13, color: "#8a8f98", margin: "4px 0 0" }}>
            공스피와 극캐감별사가 지금까지 소개·추천한 연극을 한눈에
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{
            fontSize: 13,
            fontWeight: 700,
            padding: "8px 16px",
            border: "1px solid #d7dbe0",
            borderRadius: 10,
            background: "#fff",
            color: "#4b5058",
            cursor: loading ? "default" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          <span style={{ fontSize: 14 }}>↻</span> {loading ? "불러오는 중…" : "새로고침"}
        </button>
      </div>

      {err && <p style={{ color: "#c00", fontSize: 14 }}>불러오기 오류: {err}</p>}

      {stat && !stat.configured && (
        <div style={{ background: "#fff8e6", border: "1px solid #f0d98a", borderRadius: 12, padding: "16px 18px", fontSize: 14, lineHeight: 1.7, color: "#5a4a12" }}>
          <b>집계 저장소(Vercel KV)가 연결되어야 누적됩니다.</b> 참여 통계와 동일한 KV를 사용합니다.
        </div>
      )}

      {stat && stat.configured && dashD && quizD && (
        <>
          {/* KPI 타일 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <Tile
              label="공스피 누적 소개 연극"
              value={stat.dashboard.total}
              accent={GOLD}
              sub={
                <>
                  이번 달 <b style={{ color: "#1c1f24" }}>{dashD.cur}편</b> · <DeltaChip delta={dashD.delta} />
                </>
              }
            />
            <Tile
              label="극캐 AI 추천 누적 공연"
              value={stat.quiz.total}
              accent={BLUE}
              sub={
                <>
                  이번 달 <b style={{ color: "#1c1f24" }}>{quizD.cur}편</b> · <DeltaChip delta={quizD.delta} />
                </>
              }
            />
            <Tile
              label="집계 기간 · 월 평균"
              value={periodMonths}
              accent="#7b61ff"
              unit="개월"
              sub={
                <>
                  개월간 집계 · 공스피 <b style={{ color: "#1c1f24" }}>월 {dashD.avg}편</b>
                </>
              }
            />
          </div>

          {/* 월별 추이 차트 */}
          <div style={{ ...card, padding: "18px 20px 12px", marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>월별 소개 추이</div>
              <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#6b7079", fontWeight: 700 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <i style={{ width: 10, height: 10, borderRadius: 3, background: GOLD, display: "inline-block" }} /> 공스피
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <i style={{ width: 10, height: 10, borderRadius: 3, background: BLUE, display: "inline-block" }} /> 극캐 추천
                </span>
              </div>
            </div>
            <TrendChart dash={stat.dashboard} quiz={stat.quiz} />
          </div>

          {/* 인사이트 요약 */}
          <div style={{ ...card, padding: "16px 20px", marginTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>인사이트</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.9, color: "#3e434b" }}>
              <li>
                지금까지 공스피에 오른 서로 다른 연극은 <b>{stat.dashboard.total}편</b>,
                그중 극캐가 관객에게 추천한 공연은 <b>{stat.quiz.total}편</b>입니다.
              </li>
              {dashD.peak && (
                <li>
                  공스피 소개가 가장 많았던 달은 <b>{monthLabelFull(dashD.peak)}</b> ({stat.dashboard.byMonth[dashD.peak]}편)입니다.
                </li>
              )}
              {dashD.delta != null && dashD.delta !== 0 && (
                <li>
                  이번 달 공스피 소개는 전월 대비 {dashD.delta > 0 ? "늘었습니다" : "줄었습니다"} ({dashD.delta > 0 ? "+" : ""}
                  {dashD.delta}편).
                </li>
              )}
            </ul>
          </div>

          <p style={{ color: "#aaa", fontSize: 12, marginTop: 14 }}>
            ※ 집계 시작 시점부터 누적됩니다(소급 없음). “누적”은 전체 기간 서로 다른 연극 수, “월별”은 그 달에 등장한 연극 수라 합계와 다를 수 있습니다.
          </p>
        </>
      )}
    </div>
  );
}
