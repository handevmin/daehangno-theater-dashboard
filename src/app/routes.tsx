import { createBrowserRouter } from "react-router";
import Slideshow from "./components/Slideshow";
import AdminPage from "./components/AdminPage";

export const router = createBrowserRouter([
  {
    path: "/admin",
    Component: AdminPage,
  },
  {
    path: "*",
    Component: Slideshow,
  },
]);
