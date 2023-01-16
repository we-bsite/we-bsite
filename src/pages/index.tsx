import React, { useEffect } from "react";
import Home from "../components/Home";
import { initCursorChat } from "cursor-chat";

export default function App() {
  useEffect(() => {
    initCursorChat("(we)bsite");
  }, []);

  return <Home />;
}
