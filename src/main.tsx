
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { seasonAccent } from "./app/lib/season";

  // 계절별 메인 컬러를 전역 CSS 변수(--accent)로 주입 → 모든 var(--accent) 가 계절색으로 표시
  document.documentElement.style.setProperty("--accent", seasonAccent().accent);

  createRoot(document.getElementById("root")!).render(<App />);
  