// 관리자 페이지 — 누적 소개 연극 집계.
//  - 공스피(대시보드)에 소개된 연극 누적 수 + 월별
//  - 극캐감별사에서 추천된 공연 누적 수 + 월별
// /api/seen-stat 에서 Vercel KV 집계를 읽어 온다. 앞으로(집계 시작 시점부터) 누적.
import { useEffect, useState } from "react";

const KEY_COLOR = "#efba12";

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

const fmtMonth = (m: string) => {
  const [y, mm] = m.split("-");
  return `${y}년 ${Number(mm)}월`;
};

function Section({ title, sub, ns, color }: { title: string; sub: string; ns: SeenNs; color: string }) {
  const months = Object.keys(ns.byMonth).sort();
  const max = Math.max(1, ...months.map((m) => ns.byMonth[m]));
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e5e9", borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", padding: 20, marginBottom: 18 }}>
      <div style={{ fontSize: 15, fontWeight: 800 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: "#8a8f98", marginTop: 2 }}>{sub}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "12px 0 16px" }}>
        <span style={{ fontSize: 38, fontWeight: 800, color }}>{ns.total.toLocaleString()}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#444" }}>편 (누적, 중복 제거)</span>
      </div>
      {months.length === 0 ? (
        <p style={{ color: "#999", fontSize: 13, margin: 0 }}>아직 집계된 내역이 없습니다. 데이터가 쌓이면 월별로 표시됩니다.</p>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontSize: 12, color: "#8a8f98", fontWeight: 700 }}>월별 (그 달에 소개된 연극 수)</div>
          {months.map((m) => (
            <div key={m} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 92, fontSize: 13, fontWeight: 700, flex: "0 0 auto" }}>{fmtMonth(m)}</div>
              <div style={{ flex: 1, background: "#eef0f2", borderRadius: 999, height: 18, overflow: "hidden" }}>
                <div style={{ width: `${(ns.byMonth[m] / max) * 100}%`, height: "100%", background: color, borderRadius: 999 }} />
              </div>
              <div style={{ width: 56, textAlign: "right", fontSize: 13, flex: "0 0 auto" }}><b>{ns.byMonth[m].toLocaleString()}</b>편</div>
            </div>
          ))}
        </div>
      )}
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

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "4px 24px 60px", fontFamily: "'SUIT', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>누적 소개 연극</h2>
        <button onClick={load} style={{ fontSize: 13, padding: "5px 12px", border: "1px solid #ccc", borderRadius: 6, background: "#fff", cursor: "pointer" }}>새로고침</button>
        {loading && <span style={{ fontSize: 13, color: "#999" }}>불러오는 중…</span>}
      </div>

      {err && <p style={{ color: "#c00", fontSize: 14 }}>불러오기 오류: {err}</p>}

      {stat && !stat.configured && (
        <div style={{ background: "#fff8e6", border: "1px solid #f0d98a", borderRadius: 10, padding: "16px 18px", fontSize: 14, lineHeight: 1.7, color: "#5a4a12" }}>
          <b>집계 저장소(Vercel KV)가 연결되어야 누적됩니다.</b> 참여 통계와 동일한 KV를 사용합니다.
        </div>
      )}

      {stat && stat.configured && (
        <>
          <Section
            title="공스피에 소개된 연극"
            sub="대시보드(Top·소극장·곧 공연)에 등장한 연극을 중복 없이 누적"
            ns={stat.dashboard}
            color={KEY_COLOR}
          />
          <Section
            title="극캐감별사 추천 공연"
            sub="캐릭터별 AI 추천으로 노출된 연극을 중복 없이 누적"
            ns={stat.quiz}
            color="#5aa9e6"
          />
          <p style={{ color: "#aaa", fontSize: 12, marginTop: 4 }}>
            ※ 집계 시작 시점부터 누적됩니다(소급 없음). “누적(중복 제거)”은 전체 기간 서로 다른 연극 수, “월별”은 그 달에 등장한 연극 수라 합계와 다를 수 있습니다.
          </p>
        </>
      )}
    </div>
  );
}
