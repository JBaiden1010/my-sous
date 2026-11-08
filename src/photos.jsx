// Decorative backdrop: a faded, slightly tilted collage of recipe photos.
// Purely visual (aria-hidden); can be turned off in Settings.
import React, { useMemo } from "react";
import { RECIPE_IMAGES } from "./recipe-images.js";

const IDS = Object.keys(RECIPE_IMAGES);

export function pickRecipeIds(n) {
  const ids = IDS.slice();
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  return ids.slice(0, n);
}

export function PhotoBackdrop({ outer = false, count = 48 }) {
  const ids = useMemo(() => pickRecipeIds(count), [count]);
  return (
    <div className={outer ? "ms-photos ms-photos-outer" : "ms-photos"} aria-hidden="true">
      <div className="ms-photos-grid">
        {ids.map((id) => <div key={id} style={{ backgroundImage: `url(${RECIPE_IMAGES[id]})` }} />)}
      </div>
    </div>
  );
}
