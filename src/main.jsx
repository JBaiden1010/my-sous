import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
window.React = React;
// Stand-in for the prototype sandbox's window.storage, backed by this browser's localStorage
if (!window.storage) {
  const ls = () => { try { return window.localStorage; } catch { return null; } };
  window.storage = {
    get: async (k) => { const s = ls(); const v = s ? s.getItem("mysous:" + k) : null; if (v == null) throw new Error("missing"); return { key: k, value: v }; },
    set: async (k, v) => { const s = ls(); if (s) s.setItem("mysous:" + k, v); return { key: k, value: v }; },
    delete: async (k) => { const s = ls(); if (s) s.removeItem("mysous:" + k); return { key: k, deleted: true }; },
    list: async () => ({ keys: [] }),
  };
}
const start = () => createRoot(document.getElementById("root")).render(React.createElement(App));
start();
