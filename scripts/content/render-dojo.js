// Renders the Brown and Black belt manuals (public/dojo) in a tiny DOM shim so their
// script-built views can be read as HTML. Output: scripts/content/.cache/{brown,black}/.
// Usage: node scripts/content/render-dojo.js
const fs = require("fs"), path = require("path"), vm = require("vm"), { makeEnv } = require("./shim.js");
const root = path.resolve(__dirname, "../..");
const cache = path.join(__dirname, ".cache");
const dials = ["us_office", "us_personal", "rio", "spain"], days = ["mon", "tue", "wed", "thu", "fri"];
function scriptsOf(html) {
  return [...html.matchAll(/<script(?![^>]*type="application\/json")[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).filter(s => s.trim().length > 100);
}
function jsonsOf(html) {
  return [...html.matchAll(/<script[^>]*type="application\/json"[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/script>/g)];
}
function render(belt, file, key, prefix, onlyFirstScript) {
  const html = fs.readFileSync(path.join(root, "public/dojo", file), "utf8");
  const scripts = scriptsOf(html), jsons = jsonsOf(html);
  const out = path.join(cache, belt); fs.mkdirSync(out, { recursive: true });
  const tabs = ["OV", ...[1, 2, 3, 4, 5, 6].map(n => prefix + n), "CAP"];
  let errs = 0;
  for (const tab of tabs) for (const day of (tab.startsWith(prefix) ? days : ["mon"])) for (const dl of dials) {
    const env = makeEnv({ [key]: JSON.stringify({ tab, day, dialect: dl, theme: "light" }) });
    for (const j of jsons) { const n = env.document.createElement("script"); n.id = j[1]; n.textContent = j[2]; env.byId[j[1]] = n; }
    const ctx = vm.createContext({ ...env, ...env.window });
    try { for (const s of (onlyFirstScript ? scripts.slice(0, 1) : scripts)) vm.runInContext(s, ctx, { timeout: 5000 }); }
    catch (e) { errs++; console.error(belt, tab, day, dl, "ERR", e.message); }
    const r = env.byId["view-root"];
    fs.writeFileSync(path.join(out, `${tab}_${day}_${dl}.html`), r ? r.innerHTML : "");
  }
  return { html, scripts, errs };
}
const brown = render("brown", "brown-belt.html", "dojo_brown_belt_v4", "Br", true);
{ // Brown data: script 2 (deep layers + canon) and script-1 globals
  const env = makeEnv({}); const ctx = vm.createContext({ ...env, ...env.window });
  vm.runInContext(brown.scripts[1], ctx, { timeout: 5000 });
  fs.writeFileSync(path.join(cache, "brown/canon.json"), JSON.stringify(ctx.window.DOJO_BROWN_CANON || ctx.DOJO_BROWN_CANON, null, 1));
  fs.writeFileSync(path.join(cache, "brown/deep.json"), JSON.stringify(ctx.window.DOJO_BROWN_DEEP || ctx.DOJO_BROWN_DEEP, null, 1));
  const env2 = makeEnv({}); const ctx2 = vm.createContext({ ...env2, ...env2.window });
  const expose = brown.scripts[0].replace(/renderAll\(\);\s*\}\)\(\);\s*$/, "globalThis.__X={WEEKS,DIALECTS,DIALECT_BR1,DIALECT_BR2,DIALECT_BR5,DIALECT_BR6,BR2_SCENARIOS,BR3_WORDS,BR5_QDRILL,BR6_RENO_SIM,BROWN_GRID_STAGES,SANCTUARY_L3,EVIDENCE_COLS,DAY_NAMES,DAY_ROLES,defaultState:defaultState()};})();");
  vm.runInContext(expose, ctx2, { timeout: 5000 });
  fs.writeFileSync(path.join(cache, "brown/globals.json"), JSON.stringify(ctx2.__X || null, null, 1));
}
const black = render("black", "black-belt.html", "dojo_black_belt_v4", "Bk", false);
console.log("rendered brown errs", brown.errs, "black errs", black.errs);
