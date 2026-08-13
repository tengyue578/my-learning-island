import fs from "node:fs";
import path from "node:path";

const dist = "static-dist";
const outDir = "outputs";
const outFile = path.join(outDir, "baby-learning-park-open.html");

let html = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const cssMatch = html.match(/<link rel="stylesheet" crossorigin href="\.\/(assets\/[^"]+\.css)">/);
const jsMatch = html.match(/<script type="module" crossorigin src="\.\/(assets\/[^"]+\.js)"><\/script>/);

if (!cssMatch || !jsMatch) {
  throw new Error("asset tags not found in static-dist/index.html");
}

const css = fs.readFileSync(path.join(dist, cssMatch[1]), "utf8");
const js = fs.readFileSync(path.join(dist, jsMatch[1]), "utf8");

html = html.replace(/<script type="module" crossorigin src="\.\/assets\/[^"]+\.js"><\/script>\s*/, "");
html = html.replace(
  /<link rel="stylesheet" crossorigin href="\.\/assets\/[^"]+\.css">/,
  `<style>\n${css}\n</style>`,
);
html = html.replace("</body>", `<script type="module">\n${js}\n</script>\n  </body>`);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, html, "utf8");

console.log(path.resolve(outFile));
console.log(fs.statSync(outFile).size);
