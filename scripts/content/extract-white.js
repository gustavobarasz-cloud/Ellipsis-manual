// Pulls the data consts out of White Belt's inline script (decks, dialects, grid stages,
// pocket card) without running its DOM code. Output: .cache/white/consts.json
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.resolve(__dirname, "../..");
const html = fs.readFileSync(path.join(root, "public/dojo/white-belt.html"), "utf8");
const js = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).sort((a, b) => b.length - a.length)[0];
function grab(name) {
  const i = js.indexOf(name + " =");
  if (i < 0) throw new Error("missing " + name);
  let j = js.indexOf("=", i) + 1;
  while (/\s/.test(js[j])) j++;
  const open = js[j], close = open === "{" ? "}" : "]";
  let depth = 0, k = j, inStr = null;
  for (; k < js.length; k++) {
    const c = js[k];
    if (inStr) { if (c === "\\") { k++; continue; } if (c === inStr) inStr = null; continue; }
    if (c === "'" || c === '"' || c === "`") { inStr = c; continue; }
    if (c === open) depth++; else if (c === close) { depth--; if (depth === 0) break; }
  }
  return vm.runInNewContext("(" + js.slice(j, k + 1) + ")");
}
const out = {};
for (const n of ["decks", "WHITE_DIALECTS", "WHITE_GUARD_STAGES"]) out[n] = grab(n);
const pf = js.match(/pocketFront\s*=\s*true[\s\S]{0,1200}/);
out.pocketSnippet = pf ? pf[0] : "";
fs.mkdirSync(path.join(__dirname, ".cache/white"), { recursive: true });
fs.writeFileSync(path.join(__dirname, ".cache/white/consts.json"), JSON.stringify(out, null, 1));
console.log(Object.keys(out.decks), Object.keys(out.WHITE_DIALECTS), out.WHITE_GUARD_STAGES.length);
