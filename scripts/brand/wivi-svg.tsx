// Renders Wivi to static SVG strings for the brand assets (run via scripts/brand/build.sh)
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { writeFileSync } from "node:fs";
import Wivi from "../../src/components/Wivi";
void React;
for (const mood of ["happy", "excited", "cheering"] as const) {
  const svg = renderToStaticMarkup(<Wivi mood={mood} size={200} animate={false} />)
    .replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  writeFileSync(`/tmp/wivi-${mood}.svg`, svg);
}
console.log("wivi svgs written");
