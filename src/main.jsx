/*! My Sous © 2026 Jeremy Baiden. All rights reserved. Unauthorized copying, modification or distribution of this code, design, logo or content is prohibited. */
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { startCloud, AuthScreen, isGuestChosen, chooseGuest } from "./cloud.jsx";
import { injectAppearanceCss, applyAppearance, loadAppearance } from "./appearance.js";
injectAppearanceCss();
applyAppearance(loadAppearance());
window.React = React;

// Default storage: this browser's localStorage (guests, and the claude.ai version).
function localStorageBackend() {
  const ls = () => { try { return window.localStorage; } catch { return null; } };
  return {
    get: async (k) => { const s = ls(); const v = s ? s.getItem("mysous:" + k) : null; if (v == null) throw new Error("missing"); return { key: k, value: v }; },
    set: async (k, v) => { const s = ls(); if (s) s.setItem("mysous:" + k, v); return { key: k, value: v }; },
    delete: async (k) => { const s = ls(); if (s) s.removeItem("mysous:" + k); return { key: k, deleted: true }; },
    list: async () => ({ keys: [] }),
  };
}

const root = createRoot(document.getElementById("root"));
const showApp = () => root.render(React.createElement(App));

(async () => {
  let cloud = null;
  try { cloud = await startCloud(); } catch { cloud = null; }

  if (!cloud) {
    if (!window.storage) window.storage = localStorageBackend();
    showApp();
    return;
  }

  window.mysousCloud = cloud;
  if (cloud.signedIn) {
    window.storage = cloud.storage;
    showApp();
  } else if (isGuestChosen()) {
    window.storage = localStorageBackend();
    showApp();
  } else {
    root.render(React.createElement(AuthScreen, {
      sb: cloud.sb,
      onGuest: () => { chooseGuest(); window.storage = localStorageBackend(); showApp(); },
    }));
  }
})();
