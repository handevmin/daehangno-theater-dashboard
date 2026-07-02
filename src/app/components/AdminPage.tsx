import { useState } from "react";
import { CURATION, emptyPlay, type CurationStore, type CurationContent, type CurationPlay } from "../lib/curation";

const EDIT_KEY = (() => {
  try {
    return new URLSearchParams(window.location.search).get("key") || "";
  } catch {
    return "";
  }
})();

const fmtDate = (d: Date) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

// KOPIS 공연명 검색 (프록시)
async function kopisSearch(title: string): Promise<any[]> {
  const from = new Date();
  from.setMonth(from.getMonth() - 6);
  const to = new Date();
  to.setMonth(to.getMonth() + 6);
  const url = `/api/kopis?endpoint=pblprfr&stdate=${fmtDate(from)}&eddate=${fmtDate(to)}&cpage=1&rows=30&shprfnm=${encodeURIComponent(title)}`;
  const j = await fetch(url).then((r) => r.json());
  let db = j?.dbs?.db ?? [];
  if (!Array.isArray(db)) db = db ? [db] : [];
  return db;
}
async function kopisDetail(mt20id: string): Promise<any> {
  const j = await fetch(`/api/kopis?endpoint=pblprfr/${mt20id}`).then((r) => r.json());
  const db = j?.dbs?.db;
  return Array.isArray(db) ? db[0] : db;
}
// KOPIS 만 나이 → 세는 나이(만+1), 예매사이트 표기와 동일
function ageToKorean(prfage: string): string {
  const s = String(prfage || "");
  if (s.includes("전체")) return "전체";
  const m = s.match(/(\d+)/);
  return m ? String(Number(m[1]) + 1) : "";
}

const inputStyle: React.CSSProperties = { padding: "6px 8px", border: "1px solid #ccc", borderRadius: 6, fontSize: 14 };
const labelStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 3, fontSize: 13, color: "#444" };

function PlayEditor({ play, onChange, onRemove, n }: { play: CurationPlay; onChange: (p: CurationPlay) => void; onRemove: () => void; n: number }) {
  const [q, setQ] = useState(play.title);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof CurationPlay, v: string) => onChange({ ...play, [k]: v });
  const search = async () => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      setResults(await kopisSearch(q.trim()));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  const pick = async (r: any) => {
    let d: any = null;
    try {
      d = await kopisDetail(r.mt20id);
    } catch {
      /* ignore */
    }
    onChange({
      ...play,
      title: r.prfnm || d?.prfnm || play.title,
      venue: d?.fcltynm || r.fcltynm || "",
      from: d?.prfpdfrom || r.prfpdfrom || "",
      to: d?.prfpdto || r.prfpdto || "",
      runtime: String(d?.prfruntime || "").trim(),
      age: ageToKorean(d?.prfage || ""),
      poster: r.poster || d?.poster || "",
    });
    setResults([]);
  };
  return (
    <div style={{ border: "1px solid #d8d8d8", borderRadius: 10, padding: 14, marginBottom: 12, background: "#fafafa" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
        <b style={{ width: 24 }}>{n}</b>
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} placeholder="공연명으로 KOPIS 검색" style={{ ...inputStyle, flex: 1 }} />
        <button onClick={search} disabled={loading}>{loading ? "검색중…" : "KOPIS 검색"}</button>
        <button onClick={onRemove} style={{ color: "#c00" }}>삭제</button>
      </div>
      {results.length > 0 && (
        <div style={{ maxHeight: 180, overflow: "auto", border: "1px solid #e0e0e0", borderRadius: 6, marginBottom: 8, background: "#fff" }}>
          {results.map((r, i) => (
            <div key={i} onClick={() => pick(r)} style={{ padding: "6px 10px", cursor: "pointer", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
              <b>{r.prfnm}</b> · {r.fcltynm} · {r.prfpdfrom}~{r.prfpdto} <span style={{ color: "#999" }}>[{r.genrenm}]</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <label style={labelStyle}>제목<input style={inputStyle} value={play.title} onChange={(e) => set("title", e.target.value)} /></label>
        <label style={labelStyle}>공연장<input style={inputStyle} value={play.venue} onChange={(e) => set("venue", e.target.value)} /></label>
        <label style={labelStyle}>시작일(YYYY.MM.DD)<input style={inputStyle} value={play.from} onChange={(e) => set("from", e.target.value)} /></label>
        <label style={labelStyle}>종료일(YYYY.MM.DD)<input style={inputStyle} value={play.to} onChange={(e) => set("to", e.target.value)} /></label>
        <label style={labelStyle}>러닝타임<input style={inputStyle} value={play.runtime} onChange={(e) => set("runtime", e.target.value)} /></label>
        <label style={labelStyle}>관람연령(세는나이)<input style={inputStyle} value={play.age} onChange={(e) => set("age", e.target.value)} /></label>
        <label style={{ ...labelStyle, gridColumn: "1 / 3" }}>포스터 URL<input style={inputStyle} value={play.poster} onChange={(e) => set("poster", e.target.value)} /></label>
        <label style={{ ...labelStyle, gridColumn: "1 / 3" }}>추천 문구<input style={inputStyle} value={play.quote} onChange={(e) => set("quote", e.target.value)} /></label>
      </div>
    </div>
  );
}

function PageEditor({ label, content, onChange }: { label: string; content: CurationContent; onChange: (c: CurationContent) => void }) {
  const set = (k: keyof CurationContent, v: any) => onChange({ ...content, [k]: v });
  return (
    <section style={{ marginBottom: 36, borderTop: "3px solid #121212", paddingTop: 14 }}>
      <h2 style={{ margin: "0 0 12px" }}>{label}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <label style={labelStyle}>분위기 해시태그(예: 유쾌한 하루)<input style={inputStyle} value={content.hashtag} onChange={(e) => set("hashtag", e.target.value)} /></label>
        <label style={labelStyle}>분위기 제목<input style={inputStyle} value={content.moodTitle} onChange={(e) => set("moodTitle", e.target.value)} /></label>
        <label style={{ ...labelStyle, gridColumn: "1 / 3" }}>설명<textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={content.moodDesc} onChange={(e) => set("moodDesc", e.target.value)} /></label>
        <label style={labelStyle}>분위기 버튼(예: 개그 · 코미디)<input style={inputStyle} value={content.vibe} onChange={(e) => set("vibe", e.target.value)} /></label>
        <label style={labelStyle}>태그(쉼표 구분, # 제외)<input style={inputStyle} value={content.tags.join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} /></label>
      </div>
      <h3 style={{ margin: "10px 0 8px" }}>공연 목록</h3>
      {content.plays.map((p, i) => (
        <PlayEditor key={i} n={i + 1} play={p} onChange={(np) => set("plays", content.plays.map((x, j) => (j === i ? np : x)))} onRemove={() => set("plays", content.plays.filter((_, j) => j !== i))} />
      ))}
      <button onClick={() => set("plays", [...content.plays, emptyPlay()])}>+ 공연 추가</button>
    </section>
  );
}

export default function AdminPage() {
  const [store, setStore] = useState<CurationStore>(() => JSON.parse(JSON.stringify(CURATION)));
  const [msg, setMsg] = useState("");
  const save = async () => {
    setMsg("저장 중…");
    try {
      const res = await fetch("/api/save-curation" + (EDIT_KEY ? `?key=${encodeURIComponent(EDIT_KEY)}` : ""), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) setMsg("저장됨 ✓ " + (j.note || ""));
      else if (res.status === 401) setMsg("저장 실패(401): 편집 키가 없거나 틀립니다 — 주소에 ?admin=1&key=◯◯◯ 형태로 접속하세요.");
      else setMsg(`저장 실패(${res.status}): ${j.error || "서버 오류"}`);
    } catch {
      setMsg("저장 실패: 네트워크 오류");
    }
  };
  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: 24, fontFamily: "'SUIT', sans-serif" }}>
      <h1 style={{ marginBottom: 6 }}>추천 페이지 관리자</h1>
      <p style={{ color: "#666", marginTop: 0, fontSize: 14 }}>
        공연은 <b>KOPIS 검색</b>으로 선택하면 포스터·공연장·기간·러닝타임·나이가 자동 입력됩니다. 분위기·문구는 직접 입력하세요. <b>저장</b>하면 GitHub 커밋 → 약 1분 뒤 모든 화면에 반영됩니다.
      </p>
      <PageEditor label="서울연극센터가 추천하는 오늘의 공연" content={store.seoul} onChange={(c) => setStore({ ...store, seoul: c })} />
      <PageEditor label="AI가 추천하는 오늘의 공연" content={store.ai} onChange={(c) => setStore({ ...store, ai: c })} />
      <div style={{ position: "sticky", bottom: 0, background: "#fff", padding: "12px 0", borderTop: "1px solid #ddd", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={save} style={{ fontSize: 16, padding: "10px 24px", background: "#121212", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>저장 (GitHub 커밋)</button>
        <span style={{ fontSize: 14 }}>{msg}</span>
      </div>
    </div>
  );
}
