// 관리자 페이지 — 극캐감별사 참여 통계 (총 참여 수 + 캐릭터별 분포).
// /api/quiz-stat 에서 Vercel KV 집계를 읽어 온다. 미설정 시 설정 안내를 보여준다.
import { useEffect, useState } from "react";
import { GALLERY, RESULTS, circleImg, type CharKey } from "../pages/quiz/quizData";

const KEY_COLOR = "#efba12";

interface Stat {
  configured: boolean;
  total: number;
  byChar: Record<string, number>;
}

export default function QuizStatsView() {
  const [stat, setStat] = useState<Stat | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setErr("");
    fetch("/api/quiz-stat", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setStat(j))
      .catch((e) => setErr(String(e?.message || e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const rows = GALLERY.map((g) => ({
    key: g.key as CharKey,
    name: RESULTS[g.key as CharKey]?.name ?? g.name,
    count: stat?.byChar?.[g.key] ?? 0,
  })).sort((a, b) => b.count - a.count);

  const total = stat?.total ?? 0;
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "4px 24px 60px", fontFamily: "'SUIT', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>참여 통계</h2>
        <button
          onClick={load}
          style={{ fontSize: 13, padding: "5px 12px", border: "1px solid #ccc", borderRadius: 6, background: "#fff", cursor: "pointer" }}
        >
          새로고침
        </button>
        {loading && <span style={{ fontSize: 13, color: "#999" }}>불러오는 중…</span>}
      </div>

      {err && <p style={{ color: "#c00", fontSize: 14 }}>불러오기 오류: {err}</p>}

      {stat && !stat.configured && (
        <div style={{ background: "#fff8e6", border: "1px solid #f0d98a", borderRadius: 10, padding: "16px 18px", fontSize: 14, lineHeight: 1.7, color: "#5a4a12" }}>
          <b>아직 집계 저장소가 연결되지 않았습니다.</b> 참여 수를 누적하려면 <b>Vercel KV</b>(무료)를 연결해 주세요.
          <ol style={{ margin: "8px 0 0", paddingLeft: 20 }}>
            <li>Vercel 대시보드 → 프로젝트 → <b>Storage</b> → <b>Create Database</b> → <b>KV (Upstash Redis)</b> 선택 후 생성</li>
            <li>생성된 KV를 이 프로젝트에 <b>Connect</b> (환경변수 <code>KV_REST_API_URL</code>·<code>KV_REST_API_TOKEN</code> 자동 주입)</li>
            <li>재배포 후 이 화면에서 <b>새로고침</b> → 그때부터 참여가 집계됩니다</li>
          </ol>
          <div style={{ marginTop: 8, fontSize: 12.5, color: "#8a7a3a" }}>
            연결 전에도 퀴즈는 정상 동작하며, 집계만 되지 않습니다.
          </div>
        </div>
      )}

      {stat && stat.configured && (
        <>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "6px 0 18px" }}>
            <span style={{ fontSize: 40, fontWeight: 800, color: KEY_COLOR }}>{total.toLocaleString()}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#444" }}>명 참여</span>
          </div>

          {total === 0 ? (
            <p style={{ color: "#888", fontSize: 14 }}>아직 참여 기록이 없습니다. 첫 참여가 들어오면 여기에 분포가 표시됩니다.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {rows.map((r) => {
                const pct = total ? Math.round((r.count / total) * 100) : 0;
                return (
                  <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img src={circleImg(r.key)} alt={r.name} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", background: "#f4f4f4", flex: "0 0 auto" }} />
                    <div style={{ width: 74, fontSize: 14, fontWeight: 700, flex: "0 0 auto" }}>{r.name}</div>
                    <div style={{ flex: 1, background: "#eef0f2", borderRadius: 999, height: 22, overflow: "hidden", position: "relative" }}>
                      <div style={{ width: `${(r.count / max) * 100}%`, height: "100%", background: KEY_COLOR, borderRadius: 999, transition: "width 0.3s" }} />
                    </div>
                    <div style={{ width: 96, textAlign: "right", fontSize: 14, flex: "0 0 auto" }}>
                      <b>{r.count.toLocaleString()}명</b> <span style={{ color: "#999", fontSize: 12 }}>({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
