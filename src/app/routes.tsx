import { createBrowserRouter } from "react-router";
import Slideshow from "./components/Slideshow";

export const router = createBrowserRouter([
  {
    path: "*",
    Component: Slideshow,
  },
]);
