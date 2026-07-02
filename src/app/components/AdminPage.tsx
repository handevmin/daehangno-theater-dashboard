import { useEffect, useState } from "react";
import CurationComponent, { type CurationEdit } from "../../imports/추천";
import { CURATION, emptyPlay, type CurationStore, type CurationContent, type CurationPlay } from "../lib/curation";

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

const PAGES = [
  { key: "seoul" as const, source: "서울연극센터" },
  { key: "ai" as const, source: "AI" },
];

type SearchTarget = { page: "seoul" | "ai"; index: number };

export default function AdminPage() {
  const [store, setStore] = useState<CurationStore>(() => JSON.parse(JSON.stringify(CURATION)));
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [scale, setScale] = useState(1);
  const [target, setTarget] = useState<SearchTarget | null>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg] = useState("");

  useEffect(() => {
    const update = () => setScale(Math.min(1, (window.innerWidth - 48) / 1440));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const patchContent = (page: "seoul" | "ai", patch: Partial<CurationContent>) =>
    setStore((s) => ({ ...s, [page]: { ...s[page], ...patch } }));
  const patchPlay = (page: "seoul" | "ai", i: number, patch: Partial<CurationPlay>) =>
    setStore((s) => ({ ...s, [page]: { ...s[page], plays: s[page].plays.map((p, j) => (j === i ? { ...p, ...patch } : p)) } }));

  const editFor = (page: "seoul" | "ai"): CurationEdit => ({
    onField: (k, v) => patchContent(page, { [k]: v }),
    onTags: (tags) => patchContent(page, { tags }),
    onPlay: (i, patch) => patchPlay(page, i, patch),
    onSearch: (i) => {
      setTarget({ page, index: i });
      setQ(store[page].plays[i]?.title || "");
      setResults([]);
    },
    onAddPlay: () => setStore((s) => ({ ...s, [page]: { ...s[page], plays: [...s[page].plays, emptyPlay()] } })),
    onRemovePlay: (i) => setStore((s) => ({ ...s, [page]: { ...s[page], plays: s[page].plays.filter((_, j) => j !== i) } })),
  });

  // AI 자동 생성: GPT가 오늘의 의미·절기·날씨로 추천한 대학로 연극으로 AI 섹션을 채운다(확인·수정 후 저장).
  const generateAi = async () => {
    setGenerating(true);
    setGenMsg("AI가 오늘의 추천을 생성 중… (약 10초)");
    try {
      const r = await fetch("/api/ai-curation", { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || `생성 실패 (${r.status})`);
      if (!Array.isArray(j?.plays) || !j.plays.length) throw new Error("추천 결과가 비어 있습니다");
      const content: CurationContent = {
        hashtag: String(j.hashtag || ""),
        moodTitle: String(j.moodTitle || ""),
        moodDesc: String(j.moodDesc || ""),
        vibe: String(j.vibe || ""),
        tags: Array.isArray(j.tags) ? j.tags.map((t: any) => String(t)) : [],
        plays: j.plays.map((p: any) => ({
          title: String(p.title || ""),
          venue: String(p.venue || ""),
          from: String(p.from || ""),
          to: String(p.to || ""),
          runtime: String(p.runtime || ""),
          age: String(p.age || ""),
          poster: String(p.poster || ""),
          quote: String(p.quote || ""),
        })),
      };
      setStore((s) => ({ ...s, ai: content }));
      setGenMsg("생성 완료 — 내용을 확인·수정한 뒤 저장하세요");
    } catch (e: any) {
      setGenMsg("생성 실패: " + (e?.message || e));
    } finally {
      setGenerating(false);
    }
  };

  const doSearch = async () => {
    if (!q.trim()) return;
    setSearching(true);
    try {
      setResults(await kopisSearch(q.trim()));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };
  const pick = async (r: any) => {
    if (!target) return;
    let d: any = null;
    try {
      d = await kopisDetail(r.mt20id);
    } catch {
      /* ignore */
    }
    patchPlay(target.page, target.index, {
      title: r.prfnm || d?.prfnm || "",
      venue: d?.fcltynm || r.fcltynm || "",
      from: d?.prfpdfrom || r.prfpdfrom || "",
      to: d?.prfpdto || r.prfpdto || "",
      runtime: String(d?.prfruntime || "").trim(),
      age: ageToKorean(d?.prfage || ""),
      poster: r.poster || d?.poster || "",
    });
    setTarget(null);
    setResults([]);
  };

  const save = async () => {
    setSaving(true);
    setMsg("저장 중…");
    try {
      const res = await fetch("/api/save-curation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) setMsg("저장됨 ✓ 잠시 후 화면에 반영됩니다");
      else setMsg(`저장 실패(${res.status}): ${j.error || "서버 오류"}`);
    } catch {
      setMsg("저장 실패: 네트워크 오류");
    } finally {
      setSaving(false);
    }
  };

  const pageHeight = (c: CurationContent) => Math.max(780, 360 + c.plays.length * 250);

  return (
    <div style={{ minHeight: "100vh", background: "#eef0f2", fontFamily: "'SUIT', sans-serif", paddingBottom: 90 }}>
      <div style={{ maxWidth: 1500, margin: "0 auto", padding: "20px 24px 0" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 24 }}>추천 페이지 관리자</h1>
        <p style={{ color: "#555", marginTop: 0, fontSize: 14, lineHeight: 1.5 }}>
          글자를 클릭해 바로 고치면 줄바꿈·줄 수가 즉시 반영됩니다.
          공연 카드의 <b>KOPIS 검색</b>으로 공연을 고르면 포스터·공연장·기간·러닝타임·나이가 자동 입력됩니다.
          AI 페이지는 <b>✨ AI 자동 생성</b>으로 오늘의 추천을 불러온 뒤 확인·수정할 수 있습니다.
          <b> 저장하면 화면에 반영됩니다.</b>
        </p>
      </div>

      {PAGES.map(({ key, source }) => (
        <div key={key} style={{ maxWidth: 1500, margin: "0 auto", padding: "8px 24px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0 8px", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{source}가 추천하는 오늘의 공연</span>
            {key === "ai" && (
              <>
                <button
                  onClick={generateAi}
                  disabled={generating}
                  style={{ fontSize: 13, padding: "6px 14px", background: "#1f6f4f", color: "#fff", border: "none", borderRadius: 6, cursor: generating ? "default" : "pointer", opacity: generating ? 0.6 : 1 }}
                  title="GPT가 오늘의 의미·절기·날씨로 대학로 연극을 추천해 아래를 채웁니다. 확인·수정 후 저장하세요."
                >
                  ✨ AI 자동 생성
                </button>
                <span style={{ fontSize: 13, color: genMsg.includes("실패") ? "#c00" : "#2a7", }}>{genMsg}</span>
              </>
            )}
          </div>
          <div
            style={{
              width: 1440 * scale,
              height: pageHeight(store[key]) * scale,
              overflow: "hidden",
              border: "1px solid #d5d8dc",
              borderRadius: 10,
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ width: 1440, height: pageHeight(store[key]), transform: `scale(${scale})`, transformOrigin: "top left", position: "relative" }}>
              <CurationComponent source={source} content={store[key]} edit={editFor(key)} />
            </div>
          </div>
        </div>
      ))}

      {/* KOPIS 검색 모달 */}
      {target && (
        <div
          onClick={() => setTarget(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 12, padding: 20, width: 600, maxHeight: "82vh", overflow: "auto" }}>
            <h3 style={{ margin: "0 0 10px" }}>KOPIS 공연 검색</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                placeholder="공연명으로 검색 후 선택"
                style={{ flex: 1, padding: "8px 10px", border: "1px solid #ccc", borderRadius: 6, fontSize: 14 }}
              />
              <button onClick={doSearch} disabled={searching} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#121212", color: "#fff", cursor: "pointer" }}>
                {searching ? "검색중…" : "검색"}
              </button>
            </div>
            {results.length === 0 && !searching && <p style={{ color: "#999", fontSize: 13 }}>검색 결과가 여기에 표시됩니다.</p>}
            <div>
              {results.map((r, i) => (
                <div
                  key={i}
                  onClick={() => pick(r)}
                  style={{ display: "flex", gap: 10, padding: "8px 6px", cursor: "pointer", borderBottom: "1px solid #f0f0f0", alignItems: "center" }}
                >
                  {r.poster ? <img alt="" src={r.poster} style={{ width: 34, height: 48, objectFit: "cover", borderRadius: 3, flexShrink: 0 }} /> : null}
                  <div style={{ fontSize: 13 }}>
                    <b>{r.prfnm}</b>
                    <div style={{ color: "#888" }}>
                      {r.fcltynm} · {r.prfpdfrom}~{r.prfpdto} · {r.genrenm}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <button onClick={() => setTarget(null)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 저장 바 */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #ddd", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 14, zIndex: 100 }}>
        <span style={{ fontSize: 14, color: msg.includes("실패") ? "#c00" : "#333" }}>{msg}</span>
        <button
          onClick={save}
          disabled={saving}
          style={{ fontSize: 16, padding: "10px 26px", background: "#121212", color: "#fff", border: "none", borderRadius: 8, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}
        >
          저장
        </button>
      </div>
    </div>
  );
}
