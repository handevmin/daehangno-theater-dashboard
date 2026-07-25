// 관리자 페이지 — 극캐감별사 설문 내용 확인(읽기 전용).
// 문항/보기별 캐릭터 배점, 8개 캐릭터 결과(설명·인용·케미)를 한 화면에서 검토한다.
import {
  META,
  QUESTIONS,
  RESULTS,
  GALLERY,
  circleImg,
  type CharKey,
} from "../pages/quiz/quizData";

const KEY_COLOR = "#efba12";

function CharBadge({ char }: { char: CharKey }) {
  const c = RESULTS[char];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: "rgba(239,186,18,0.14)",
        color: "#7a5c00",
        border: "1px solid rgba(239,186,18,0.5)",
        borderRadius: 999,
        padding: "2px 9px 2px 3px",
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <img
        src={circleImg(char)}
        alt={c.name}
        style={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover", background: "#f4f4f4" }}
      />
      {c.name}
    </span>
  );
}

export default function QuizAdminView() {
  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #e2e5e9",
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "4px 24px 60px", fontFamily: "'SUIT', sans-serif" }}>
      <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6, marginTop: 0 }}>
        극캐감별사(<code>/quiz</code>) 심리테스트의 실제 설문 내용입니다. <b>읽기 전용</b>이며 수정은 되지 않습니다.
        <br />
        채점 방식: 각 보기를 고르면 해당 캐릭터에 <b>1점</b>씩 쌓이고, <b>최고점 캐릭터가 결과</b>입니다(동점이면 먼저 고른 캐릭터 우선).
        총 <b>{QUESTIONS.length}문항 · 결과 {GALLERY.length}캐릭터</b>.
      </p>

      {/* ── 문항 ── */}
      <h2 style={{ fontSize: 18, margin: "26px 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: KEY_COLOR }}>①</span> 문항 ({QUESTIONS.length})
      </h2>
      <div style={{ display: "grid", gap: 12 }}>
        {QUESTIONS.map((qq, qi) => (
          <div key={qi} style={{ ...card, padding: "14px 18px" }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>
              <span style={{ color: KEY_COLOR }}>Q{qi + 1}.</span> {qq.q}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {qq.options.map((opt, oi) => (
                <div
                  key={oi}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    background: "#f7f8f9",
                    border: "1px solid #e8ebef",
                    borderRadius: 8,
                    padding: "8px 10px",
                  }}
                >
                  <span style={{ fontSize: 13, whiteSpace: "pre-line", lineHeight: 1.4 }}>
                    {opt.text.replace(/\n/g, " ")}
                  </span>
                  <CharBadge char={opt.char} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── 결과 캐릭터 ── */}
      <h2 style={{ fontSize: 18, margin: "34px 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: KEY_COLOR }}>②</span> 결과 캐릭터 ({GALLERY.length})
      </h2>
      <div style={{ display: "grid", gap: 14 }}>
        {GALLERY.map((g) => {
          const r = RESULTS[g.key];
          return (
            <div key={g.key} style={{ ...card, padding: 18, display: "flex", gap: 16 }}>
              <img
                src={circleImg(g.key)}
                alt={r.name}
                style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", background: "#f4f4f4", flex: "0 0 auto" }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: KEY_COLOR }}>{r.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#444" }}>{g.title}</span>
                </div>
                <div style={{ fontSize: 13, fontStyle: "italic", color: "#333", marginTop: 8, lineHeight: 1.5 }}>
                  {r.quote.join(" ")}{" "}
                  <span style={{ color: "#999", fontStyle: "normal" }}>— {r.source}</span>
                </div>
                {r.description.map((p, i) => (
                  <p key={i} style={{ fontSize: 13, color: "#555", lineHeight: 1.7, margin: "8px 0 0", textAlign: "justify" }}>
                    {p.trim()}
                  </p>
                ))}
                <div style={{ display: "flex", gap: 18, marginTop: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13 }}>
                    <b style={{ color: "#2a7" }}>{r.chemGood.label}</b> <CharBadge char={r.chemGood.char} />
                  </span>
                  <span style={{ fontSize: 13 }}>
                    <b style={{ color: "#c55" }}>{r.chemBad.label}</b> <CharBadge char={r.chemBad.char} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ color: "#aaa", fontSize: 12, marginTop: 24 }}>
        원본: smore.im 심리테스트 이식 · 결과 화면 “{META.title}”
      </p>
    </div>
  );
}
