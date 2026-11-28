// Minimal DOM shim: enough for the manuals' render code to build a tree we can serialize.
const VOID = new Set(["br","hr","img","input","meta","link"]);
function escText(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function escAttr(s){return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;");}
class Node_ { constructor(){ this.parentNode=null; } remove(){ if(this.parentNode){ const c=this.parentNode._c; const i=c.indexOf(this); if(i>=0) c.splice(i,1); this.parentNode=null; } } }
class Text_ extends Node_ { constructor(t){ super(); this.t=String(t); this.nodeType=3; } get textContent(){return this.t;} html(){ return escText(this.t); } }
class Raw_ extends Node_ { constructor(h){ super(); this.h=String(h); } html(){ return this.h; } }
function mkClassList(el){ return {
  add:(...a)=>{ const s=new Set(el.className.split(/\s+/).filter(Boolean)); a.forEach(x=>s.add(x)); el.className=[...s].join(" "); },
  remove:(...a)=>{ el.className=el.className.split(/\s+/).filter(x=>x&&!a.includes(x)).join(" "); },
  toggle:(x,f)=>{ const has=el.className.split(/\s+/).includes(x); const on = f===undefined? !has : !!f; if(on&&!has) el.classList.add(x); if(!on&&has) el.classList.remove(x); return on; },
  contains:(x)=>el.className.split(/\s+/).includes(x) }; }
class El_ extends Node_ {
  constructor(tag){ super(); this.tagName=String(tag).toUpperCase(); this.tag=String(tag).toLowerCase(); this._c=[]; this.attrs={}; this.className=""; this.style=new Proxy({}, {set:(o,k,v)=>{o[k]=v;return true;}}); this.dataset={}; this.classList=mkClassList(this); this.value=""; this.checked=false; this.hidden=false; this.disabled=false; this.nodeType=1; }
  get children(){ return this._c.filter(x=>x instanceof El_); }
  get childNodes(){ return this._c; }
  get firstChild(){ return this._c[0]||null; }
  appendChild(n){ if(n==null) return n; if(typeof n==="string") n=new Text_(n); if(n.parentNode) n.remove(); n.parentNode=this; this._c.push(n); return n; }
  append(...ns){ ns.forEach(n=>this.appendChild(n)); }
  prepend(...ns){ ns.reverse().forEach(n=>{ if(typeof n==="string") n=new Text_(n); n.parentNode=this; this._c.unshift(n); }); }
  insertBefore(n,ref){ if(typeof n==="string") n=new Text_(n); if(n.parentNode) n.remove(); n.parentNode=this; const i=ref?this._c.indexOf(ref):-1; if(i<0) this._c.push(n); else this._c.splice(i,0,n); return n; }
  replaceChildren(...ns){ this._c=[]; this.append(...ns); }
  removeChild(n){ n.remove(); return n; }
  set innerHTML(h){ this._c=[]; if(h!==""&&h!=null) this.appendChild(new Raw_(h)); }
  get innerHTML(){ return this._c.map(c=>c instanceof El_? c.outerHTML : c.html()).join(""); }
  set textContent(t){ this._c=[]; if(t!==""&&t!=null) this.appendChild(new Text_(t)); }
  get textContent(){ return this._c.map(c=>c instanceof El_? c.textContent : (c instanceof Text_? c.t : c.h.replace(/<[^>]+>/g,""))).join(""); }
  set innerText(t){ this.textContent=t; } get innerText(){ return this.textContent; }
  setAttribute(k,v){ this.attrs[k]=String(v); if(k==="class") this.className=String(v); if(k.startsWith("data-")) this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(v); }
  getAttribute(k){ if(k==="class") return this.className; return this.attrs[k] ?? null; }
  removeAttribute(k){ delete this.attrs[k]; }
  hasAttribute(k){ return k in this.attrs; }
  addEventListener(){} removeEventListener(){} focus(){} blur(){} select(){} click(){} scrollIntoView(){} setSelectionRange(){}
  closest(){ return null; } matches(){ return false; }
  querySelector(sel){ return findOne(this, sel); }
  querySelectorAll(sel){ return findAll(this, sel); }
  getBoundingClientRect(){ return {top:0,left:0,width:0,height:0,bottom:0,right:0}; }
  get outerHTML(){
    let a="";
    if(this.className) a+=` class="${escAttr(this.className)}"`;
    for(const [k,v] of Object.entries(this.attrs)) if(k!=="class") a+=` ${k}="${escAttr(v)}"`;
    for(const [k,v] of Object.entries(this.dataset)){ const dk="data-"+k.replace(/[A-Z]/g,m=>"-"+m.toLowerCase()); if(!(dk in this.attrs)) a+=` ${dk}="${escAttr(v)}"`; }
    if(this.tag==="textarea"||this.tag==="input"||this.tag==="select") { if(this.attrs.placeholder===undefined && this.placeholder) a+=` placeholder="${escAttr(this.placeholder)}"`; }
    if(VOID.has(this.tag)) return `<${this.tag}${a}>`;
    return `<${this.tag}${a}>${this.innerHTML}</${this.tag}>`;
  }
}
// very small selector support: .class, tag, #id, tag.class, [attr]
function matchSel(el, sel){
  sel=sel.trim(); if(!sel) return false;
  const m = sel.match(/^([a-zA-Z0-9]*)((?:\.[\w-]+)*)(#[\w-]+)?(\[[^\]]+\])?/);
  if(!m) return false;
  if(m[1] && el.tag!==m[1].toLowerCase()) return false;
  if(m[2]){ const cls=m[2].split(".").filter(Boolean); const have=el.className.split(/\s+/); if(!cls.every(c=>have.includes(c))) return false; }
  if(m[3] && el.attrs.id!==m[3].slice(1)) return false;
  return !!(m[1]||m[2]||m[3]);
}
function walk(el, f){ for(const c of el._c){ if(c instanceof El_){ f(c); walk(c,f); } } }
function findAll(root, sel){ const out=[]; const parts=sel.split(",").map(s=>s.trim().split(/\s+/).pop()); walk(root, e=>{ if(parts.some(p=>matchSel(e,p))) out.push(e); }); return out; }
function findOne(root, sel){ return findAll(root, sel)[0] || null; }
function makeEnv(storage){
  const byId={};
  const body=new El_("body");
  const documentElement=new El_("html");
  const document={
    createElement:(t)=>new El_(t), createTextNode:(t)=>new Text_(t), createDocumentFragment:()=>new El_("fragment"),
    getElementById:(id)=>{ if(!byId[id]){ byId[id]=new El_("div"); byId[id].attrs.id=id; } return byId[id]; },
    querySelector:(s)=>{ for(const id in byId){ const r=findOne(byId[id],s); if(r) return r; } return null; },
    querySelectorAll:(s)=>{ let out=[]; for(const id in byId) out=out.concat(findAll(byId[id],s)); return out; },
    addEventListener(){}, removeEventListener(){}, execCommand(){ return true; },
    body, documentElement, title:"",
  };
  const ls={ _d:{...storage}, getItem(k){ return k in this._d? this._d[k] : null; }, setItem(k,v){ this._d[k]=String(v); }, removeItem(k){ delete this._d[k]; } };
  const window={ document, localStorage:ls, matchMedia:()=>({matches:false, addEventListener(){}, addListener(){}}), scrollTo(){}, print(){}, alert(){}, confirm(){return false;}, addEventListener(){}, navigator:{clipboard:{writeText:()=>Promise.resolve()}}, location:{reload(){}, hash:""} };
  window.window=window;
  return { window, document, localStorage:ls, byId,
    MutationObserver: class { observe(){} disconnect(){} },
    setTimeout:()=>0, clearTimeout(){}, setInterval:()=>0, clearInterval(){}, requestAnimationFrame:()=>0,
    alert(){}, confirm(){return false;}, prompt(){return null;}, navigator:window.navigator, location:window.location,
    URL:{createObjectURL:()=>"blob:"}, Blob: class{}, FileReader: class{ readAsText(){} }, console };
}
module.exports={ makeEnv, El_ };
