// Built-in line icons (Lucide-style, 24x24, stroke-based) so the app never
// depends on an outside icon library loading. Same props as lucide-react:
// size, color, strokeWidth, fill, style.
import React from "react";

const ICONS = {
  Home: [["path", { d: "M3 10.5 12 3l9 7.5" }], ["path", { d: "M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" }]],
  Refrigerator: [["rect", { x: 5, y: 2, width: 14, height: 20, rx: 2 }], ["path", { d: "M5 10h14" }], ["path", { d: "M9 5v2" }], ["path", { d: "M9 13v3" }]],
  ChefHat: [["path", { d: "M17 21a1 1 0 0 0 1-1v-5.35c0-.46.32-.84.75-1.03A4 4 0 0 0 17 6a4 4 0 0 0-.86.09 5 5 0 0 0-8.28 0A4 4 0 0 0 7 6a4 4 0 0 0-1.75 7.62c.43.19.75.57.75 1.03V20a1 1 0 0 0 1 1Z" }], ["path", { d: "M6 17h12" }]],
  Users: [["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }], ["circle", { cx: 9, cy: 7, r: 4 }], ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }], ["path", { d: "M16 3.13a4 4 0 0 1 0 7.75" }]],
  Target: [["circle", { cx: 12, cy: 12, r: 10 }], ["circle", { cx: 12, cy: 12, r: 6 }], ["circle", { cx: 12, cy: 12, r: 2 }]],
  Clock: [["circle", { cx: 12, cy: 12, r: 10 }], ["path", { d: "M12 6v6l4 2" }]],
  Plus: [["path", { d: "M5 12h14" }], ["path", { d: "M12 5v14" }]],
  X: [["path", { d: "M18 6 6 18" }], ["path", { d: "m6 6 12 12" }]],
  Check: [["path", { d: "M20 6 9 17l-5-5" }]],
  Flame: [["path", { d: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" }]],
  Utensils: [["path", { d: "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" }], ["path", { d: "M7 2v20" }], ["path", { d: "M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" }]],
  ArrowLeft: [["path", { d: "m12 19-7-7 7-7" }], ["path", { d: "M19 12H5" }]],
  Star: [["path", { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" }]],
  Search: [["circle", { cx: 11, cy: 11, r: 8 }], ["path", { d: "m21 21-4.3-4.3" }]],
  Settings: [["path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }], ["circle", { cx: 12, cy: 12, r: 3 }]],
  RotateCcw: [["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }], ["path", { d: "M3 3v5h5" }]],
  Heart: [["path", { d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" }]],
  BookOpen: [["path", { d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" }], ["path", { d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" }]],
  ShoppingCart: [["circle", { cx: 8, cy: 21, r: 1 }], ["circle", { cx: 19, cy: 21, r: 1 }], ["path", { d: "M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" }]],
  ChevronRight: [["path", { d: "m9 18 6-6-6-6" }]],
  Award: [["circle", { cx: 12, cy: 8, r: 6 }], ["path", { d: "M15.48 12.89 17 22l-5-3-5 3 1.52-9.11" }]],
  ThumbsUp: [["path", { d: "M7 10v12" }], ["path", { d: "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" }]],
  Globe: [["circle", { cx: 12, cy: 12, r: 10 }], ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }], ["path", { d: "M2 12h20" }]],
  Pencil: [["path", { d: "M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" }], ["path", { d: "m15 5 4 4" }]],
  Eye: [["path", { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" }], ["circle", { cx: 12, cy: 12, r: 3 }]],
  Smartphone: [["rect", { x: 5, y: 2, width: 14, height: 20, rx: 2, ry: 2 }], ["path", { d: "M12 18h.01" }]],
  MessageSquare: [["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }]],
  Sun: [["circle", { cx: 12, cy: 12, r: 4 }], ["path", { d: "M12 2v2" }], ["path", { d: "M12 20v2" }], ["path", { d: "m4.93 4.93 1.41 1.41" }], ["path", { d: "m17.66 17.66 1.41 1.41" }], ["path", { d: "M2 12h2" }], ["path", { d: "M20 12h2" }], ["path", { d: "m6.34 17.66-1.41 1.41" }], ["path", { d: "m19.07 4.93-1.41 1.41" }]],
  Moon: [["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" }]],
  Monitor: [["rect", { x: 2, y: 3, width: 20, height: 14, rx: 2 }], ["path", { d: "M8 21h8" }], ["path", { d: "M12 17v4" }]],
};

const mk = (name) => {
  const Icon = ({ size = 24, color = "currentColor", strokeWidth = 2, fill = "none", style, className }) =>
    React.createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        strokeWidth,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        // colours go through style so CSS variables (light/dark mode) work
        style: { display: "inline-block", flexShrink: 0, verticalAlign: "middle", stroke: color, fill, ...style },
        className,
        "aria-hidden": "true",
      },
      ICONS[name].map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs })),
    );
  Icon.displayName = name;
  return Icon;
};

export const Home = mk("Home");
export const Refrigerator = mk("Refrigerator");
export const ChefHat = mk("ChefHat");
export const Users = mk("Users");
export const Target = mk("Target");
export const Clock = mk("Clock");
export const Plus = mk("Plus");
export const X = mk("X");
export const Check = mk("Check");
export const Flame = mk("Flame");
export const Utensils = mk("Utensils");
export const ArrowLeft = mk("ArrowLeft");
export const Star = mk("Star");
export const Search = mk("Search");
export const Settings = mk("Settings");
export const RotateCcw = mk("RotateCcw");
export const Heart = mk("Heart");
export const BookOpen = mk("BookOpen");
export const ShoppingCart = mk("ShoppingCart");
export const ChevronRight = mk("ChevronRight");
export const Award = mk("Award");
export const ThumbsUp = mk("ThumbsUp");
export const Globe = mk("Globe");
export const Pencil = mk("Pencil");
export const Eye = mk("Eye");
export const Smartphone = mk("Smartphone");
export const Monitor = mk("Monitor");
export const Sun = mk("Sun");
export const MessageSquare = mk("MessageSquare");
export const Moon = mk("Moon");
