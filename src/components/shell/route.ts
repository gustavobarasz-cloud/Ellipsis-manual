// Reads where the person is from the URL, for the top bar, tabs and accent colour.
import type { NavTrack } from "@/lib/nav";

export interface Crumb { href: string; label: string }
export interface RouteInfo {
  track?: NavTrack;
  moduleId?: string;
  dayId?: string;
  section?: "learn" | "practice" | "journal";
  crumbs: Crumb[];
  parent?: string;
  accent: string;
  pocket: string;
  showTabs: boolean;
}

export function routeInfo(pathname: string, nav: NavTrack[]): RouteInfo {
  const seg = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ href: "/", label: "Home" }];
  const out: RouteInfo = { crumbs, accent: "profiling", pocket: "white", showTabs: false };
  if (seg[0] === "field-card") {
    crumbs.push({ href: pathname, label: "Field card" });
    out.parent = "/communication";
    out.pocket = seg[1] && ["white", "blue", "brown", "black", "sanctuary"].includes(seg[1]) ? seg[1] : "white";
    out.accent = out.pocket === "sanctuary" ? "presence" : out.pocket;
    return out;
  }
  if (seg[0] === "classic") {
    crumbs.push({ href: "/classic", label: "Classic v2 view" });
    out.parent = "/";
    return out;
  }
  const track = nav.find((t) => t.id === seg[0]);
  if (!track) return out;
  out.track = track;
  out.showTabs = true;
  out.accent = track.id === "communication" ? "white" : track.id;
  out.pocket = track.id === "presence" ? "sanctuary" : "white";
  crumbs.push({ href: `/${track.id}`, label: track.short });
  out.parent = "/";
  if (seg[1] === "practice" || seg[1] === "journal") {
    out.section = seg[1];
    crumbs.push({ href: `/${track.id}/${seg[1]}`, label: seg[1] === "practice" ? "Practice" : "Journal" });
    out.parent = `/${track.id}`;
    if (seg[2]) {
      crumbs.push({ href: pathname, label: "Entry" });
      out.parent = `/${track.id}/${seg[1]}`;
    }
    return out;
  }
  out.section = "learn";
  const mod = seg[1] ? track.modules.find((m) => m.id === seg[1]) : undefined;
  if (mod) {
    out.moduleId = mod.id;
    if (mod.belt) {
      out.accent = mod.belt;
      out.pocket = mod.belt;
    }
    crumbs.push({ href: `/${track.id}/${mod.id}`, label: mod.short });
    out.parent = `/${track.id}`;
    const day = seg[2] ? mod.days.find((d) => d.id === seg[2]) : undefined;
    if (day) {
      out.dayId = day.id;
      crumbs.push({ href: `/${track.id}/${mod.id}/${day.id}`, label: day.label });
      out.parent = mod.days.length > 1 ? `/${track.id}/${mod.id}` : `/${track.id}`;
    }
  }
  return out;
}
