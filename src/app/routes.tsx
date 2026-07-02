import { createBrowserRouter } from "react-router";
import Slideshow from "./components/Slideshow";
import AdminPage from "./components/AdminPage";
import QuizPage from "./pages/quiz/QuizPage";

export const router = createBrowserRouter([
  {
    path: "/admin",
    Component: AdminPage,
  },
  {
    // 극캐감별사 — "내가 만약 연극 속 주인공이라면?" (모바일 심리테스트)
    path: "/quiz",
    Component: QuizPage,
  },
  {
    path: "*",
    Component: Slideshow,
  },
]);
