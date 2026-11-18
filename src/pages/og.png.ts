import type { APIRoute } from "astro";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { site } from "../content/site";

const WIDTH = 1200;
const HEIGHT = 630;

const require = createRequire(import.meta.url);
const font = (weight: 400 | 700) =>
  readFile(require.resolve(`@fontsource/inter/files/inter-latin-${weight}-normal.woff`));

type Node = { type: string; props: { style?: Record<string, string | number>; children?: unknown } };
const el = (type: string, style: Node["props"]["style"], children?: unknown): Node => ({
  type,
  props: { style, children },
});

export const GET: APIRoute = async () => {
  const [regular, bold] = await Promise.all([font(400), font(700)]);

  const tree = el(
    "div",
    {
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: 80,
      background: "#000",
      color: "#e8dcc4",
      fontFamily: "Inter",
    },
    [
      el("div", { display: "flex", flexDirection: "column" }, [
        el("div", { fontSize: 112, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }, site.name),
        el("div", { marginTop: 28, fontSize: 44, color: "#a89f8c" }, site.tagline),
      ]),
      el("div", { display: "flex", alignItems: "center", fontSize: 30, color: "#a89f8c" }, [
        el("div", { width: 64, height: 2, background: "#e8dcc4", marginRight: 24 }),
        el("div", {}, new URL(site.url).host),
      ]),
    ],
  );

  // satori is typed for React elements; this plain object tree has the same shape.
  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: "Inter", data: regular, weight: 400, style: "normal" },
      { name: "Inter", data: bold, weight: 700, style: "normal" },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } }).render().asPng();

  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
