// 관리자 페이지 — 극캐감별사 설문/결과 텍스트 편집기.
// 문항·보기 문구와 8개 캐릭터 결과(타이틀·인용·출처·설명·케미 라벨), 갤러리 한 줄 소개를 수정하고
// 저장하면 /api/save-quiz 가 quizContent.json 을 GitHub 에 커밋 → 약 1분 뒤 재배포 반영.
// 보기별 캐릭터 배점·채점 구조는 편집 대상이 아니며(고정), 배지로 표시만 한다.
import { useMemo, useState } from "react";
import {
  META,
  QUESTIONS,
  RESULTS,
  GALLERY,
  circleImg,
  type CharKey,
  type QuizContent,
} from "../pages/quiz/quizData";

const KEY_COLOR = "#efba12";
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

function CharBadge({ char }: { char: CharKey }) {
  const c = RESULTS[char];
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: "rgba(239,186,18,0.14)", color: "#7a5c00",
        border: "1px solid rgba(239,186,18,0.5)", borderRadius: 999,
        padding: "2px 9px 2px 3px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
      }}
    >
      <img src={circleImg(char)} alt={c.name} style={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover", background: "#f4f4f4" }} />
      {c.name}
    </span>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", border: "1px solid #d5d9df",
  borderRadius: 7, padding: "7px 9px", fontSize: 13, fontFamily: "inherit", background: "#fff",
};
const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: "#8a8f98", display: "block", margin: "0 0 3px" };

function Field({ label, value, onChange, rows }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label style={{ display: "block", marginTop: 8 }}>
      <span style={labelStyle}>{label}</span>
      {rows ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
      )}
    </label>
  );
}

export default function QuizAdminView() {
  const initial = useMemo<QuizContent>(
    () => clone({ meta: META, questions: QUESTIONS, results: RESULTS, gallery: GALLERY } as QuizContent),
    [],
  );
  const [store, setStore] = useState<QuizContent>(initial);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // 불변 업데이트 헬퍼
  const upd = (fn: (s: QuizContent) => void) =>
    setStore((s) => {
      const n = clone(s);
      fn(n);
      return n;
    });

  const dirty = JSON.stringify(store) !== JSON.stringify(initial);

  async function save() {
    setSaving(true);
    setMsg("저장 중…");
    try {
      const res = await fetch("/api/save-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) setMsg("저장됨 ✓ 약 1분 뒤 화면에 반영됩니다");
      else setMsg(`저장 실패(${res.status}): ${j.error || "서버 오류"}`);
    } catch {
      setMsg("저장 실패: 네트워크 오류");
    } finally {
      setSaving(false);
    }
  }

  const card: React.CSSProperties = { background: "#fff", border: "1px solid #e2e5e9", borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" };
  const order: CharKey[] = GALLERY.map((g) => g.key);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "4px 24px 90px", fontFamily: "'SUIT', sans-serif" }}>
      <p style={{ color: "#555", fontSize: 13, lineHeight: 1.6, marginTop: 0 }}>
        문항·결과 <b>텍스트</b>를 고칠 수 있습니다. 캐릭터 배점(어느 보기가 어느 캐릭터인지)은 고정이라 배지로만 표시됩니다.
      </p>

      {/* 기본 문구 */}
      <div style={{ ...card, padding: 16, marginBottom: 18 }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>기본 문구</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="제목" value={store.meta.title} onChange={(v) => upd((s) => { s.meta.title = v; })} />
          <Field label="부제" value={store.meta.subtitle} onChange={(v) => upd((s) => { s.meta.subtitle = v; })} />
          <Field label="시작 버튼" value={store.meta.startButton} onChange={(v) => upd((s) => { s.meta.startButton = v; })} />
          <Field label="다시 시작 버튼" value={store.meta.restartText} onChange={(v) => upd((s) => { s.meta.restartText = v; })} />
          <Field label="로딩 문구" value={store.meta.loadingText} onChange={(v) => upd((s) => { s.meta.loadingText = v; })} />
        </div>
      </div>

      {/* 문항 */}
      <h2 style={{ fontSize: 18, margin: "8px 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: KEY_COLOR }}>①</span> 문항 ({store.questions.length})
      </h2>
      <div style={{ display: "grid", gap: 12 }}>
        {store.questions.map((qq, qi) => (
          <div key={qi} style={{ ...card, padding: "14px 18px" }}>
            <Field label={`Q${qi + 1} 질문`} value={qq.q} onChange={(v) => upd((s) => { s.questions[qi].q = v; })} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              {qq.options.map((opt, oi) => (
                <div key={oi} style={{ background: "#f7f8f9", border: "1px solid #e8ebef", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
                    <CharBadge char={opt.char} />
                  </div>
                  <textarea
                    value={opt.text}
                    onChange={(e) => upd((s) => { s.questions[qi].options[oi].text = e.target.value; })}
                    rows={2}
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.4 }}
                  />
                  <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>줄바꿈은 Enter</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 결과 캐릭터 */}
      <h2 style={{ fontSize: 18, margin: "34px 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: KEY_COLOR }}>②</span> 결과 캐릭터 ({order.length})
      </h2>
      <div style={{ display: "grid", gap: 14 }}>
        {order.map((k) => {
          const r = store.results[k];
          const g = store.gallery.find((x) => x.key === k)!;
          const gi = store.gallery.findIndex((x) => x.key === k);
          return (
            <div key={k} style={{ ...card, padding: 18, display: "flex", gap: 16 }}>
              <img src={circleImg(k)} alt={r.name} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", background: "#f4f4f4", flex: "0 0 auto" }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Field label="이름" value={r.name} onChange={(v) => upd((s) => { s.results[k].name = v; })} />
                  <Field label="결과 타이틀(결과 화면)" value={r.topTitle} onChange={(v) => upd((s) => { s.results[k].topTitle = v; })} />
                  <Field label="갤러리 한 줄 소개(다른 캐릭터)" value={g.title} onChange={(v) => upd((s) => { s.gallery[gi].title = v; })} />
                  <Field label="인용 출처" value={r.source} onChange={(v) => upd((s) => { s.results[k].source = v; })} />
                </div>
                <Field label="인용구 (한 줄 = 한 행)" value={r.quote.join("\n")} rows={2} onChange={(v) => upd((s) => { s.results[k].quote = v.split("\n"); })} />
                {r.description.map((p, pi) => (
                  <Field key={pi} label={`설명 문단 ${pi + 1}`} value={p} rows={4} onChange={(v) => upd((s) => { s.results[k].description[pi] = v; })} />
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
                  <div>
                    <Field label="환상의 케미 라벨" value={r.chemGood.label} onChange={(v) => upd((s) => { s.results[k].chemGood.label = v; })} />
                    <div style={{ marginTop: 4 }}><CharBadge char={r.chemGood.char} /></div>
                  </div>
                  <div>
                    <Field label="파멸의 케미 라벨" value={r.chemBad.label} onChange={(v) => upd((s) => { s.results[k].chemBad.label = v; })} />
                    <div style={{ marginTop: 4 }}><CharBadge char={r.chemBad.char} /></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 저장 바 */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #ddd", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 14, zIndex: 100 }}>
        <span style={{ fontSize: 14, color: msg.includes("실패") ? "#c00" : "#333" }}>{msg}</span>
        {dirty && !msg.includes("저장됨") && <span style={{ fontSize: 12, color: "#c90" }}>● 저장 안 된 변경</span>}
        <button
          onClick={save}
          disabled={saving || !dirty}
          style={{ fontSize: 16, padding: "10px 26px", background: dirty ? "#121212" : "#aaa", color: "#fff", border: "none", borderRadius: 8, cursor: saving || !dirty ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}
        >
          설문 저장
        </button>
      </div>
    </div>
  );
}
