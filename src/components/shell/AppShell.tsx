"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { NavTrack } from "@/lib/nav";
import type { PocketCard } from "@/lib/types";
import { boot, setDemo, useSettings } from "@/lib/store";
import { routeInfo } from "./route";
import { IconBack, IconCard, IconJournal, IconLearn, IconMore, IconPractice } from "./icons";
import Drawer from "./Drawer";
import PocketModal from "./PocketModal";
import SearchModal from "@/components/p2/SearchModal";
import Welcome, { seenWelcome } from "@/components/p2/Welcome";
import { backTarget, popJump } from "@/lib/jump";
import { bootRemote } from "@/lib/remote";

export default function AppShell({ nav, pockets, children }: { nav: NavTrack[]; pockets: Record<string, PocketCard>; children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const settings = useSettings();
  const info = useMemo(() => routeInfo(pathname, nav), [pathname, nav]);
  const [drawer, setDrawer] = useState(false);
  const [pocket, setPocket] = useState(false);
  const [search, setSearch] = useState(false);
  const [welcome, setWelcome] = useState(false);

  useEffect(() => {
    boot();
    bootRemote();
    if (!seenWelcome()) setWelcome(true);
  }, []);

  // Share Card links: /?card=<cardId> opens straight to that card.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("card");
    if (!id) return;
    fetch("/card-map.json")
      .then((r) => r.json())
      .then((map: Record<string, [string, string, string]>) => {
        const hit = map[id];
        if (hit) router.replace(hit[0]);
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "/" opens search on a keyboard (not while typing)
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (t && t.closest("input, textarea, select, [contenteditable]")) return;
      e.preventDefault();
      setDrawer(false);
      setSearch(true);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  // theme
  useEffect(() => {
    const apply = () => {
      const t = settings.theme === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : settings.theme;
      document.documentElement.dataset.theme = t;
    };
    apply();
    if (settings.theme !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [settings.theme]);

  // track accent
  useEffect(() => {
    document.documentElement.dataset.accent = info.accent;
  }, [info.accent]);

  // offline support in production builds only
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  // close overlays on navigation
  useEffect(() => {
    setDrawer(false);
    setPocket(false);
    setSearch(false);
  }, [pathname]);

  const back = () => {
    const j = backTarget(pathname);
    if (j) {
      popJump();
      if (j.useHistory) router.back();
      else router.push(j.from);
      return;
    }
    router.push(info.parent || "/");
  };
  const tabs = info.track
    ? [
        { id: "learn", label: "Learn", href: `/${info.track.id}`, Icon: IconLearn },
        { id: "practice", label: "Practice", href: `/${info.track.id}/practice`, Icon: IconPractice },
        { id: "journal", label: "Journal", href: `/${info.track.id}/journal`, Icon: IconJournal },
      ]
    : [];
  const card = pockets[info.pocket] || pockets.white;
  const here = info.crumbs[info.crumbs.length - 1];

  return (
    <div className={`app-root ${info.showTabs ? "" : "no-tabs"}`}>
      <header className="topbar no-print">
        {pathname !== "/" ? (
          <button type="button" className="icon-btn" onClick={back} aria-label="Back">
            <IconBack />
          </button>
        ) : (
          <span style={{ width: 8 }} />
        )}
        <nav className="crumbs" aria-label="Breadcrumb">
          {info.crumbs.length === 1 ? (
            <span className="here display" style={{ fontSize: 17 }}>The Dojo</span>
          ) : (
            info.crumbs.map((c, i) => {
              const last = i === info.crumbs.length - 1;
              return (
                <span key={c.href + i} style={{ display: "contents" }}>
                  {i > 0 && <span className={i === 1 ? "sep hidden sm:inline" : "sep"}>›</span>}
                  {last ? (
                    <span className="here" aria-current="page">{c.label}</span>
                  ) : (
                    <Link href={c.href} className={i === 0 ? "hidden sm:inline" : ""}>{c.label}</Link>
                  )}
                </span>
              );
            })
          )}
        </nav>
        <button type="button" className="icon-btn" onClick={() => setPocket(true)} aria-label={`Pocket card: ${card?.belt || ""}`}>
          <IconCard />
          <span className="hidden sm:inline">Pocket card</span>
        </button>
        <button type="button" className="icon-btn" onClick={() => setDrawer(true)} aria-label="More: dialect, theme, Demo, edit, backup" aria-expanded={drawer}>
          <IconMore />
        </button>
      </header>

      {settings.demo && (
        <div className="demo-pill no-print" role="status">
          Demo Mode · your entries are hidden
          <button type="button" onClick={() => setDemo(false)}>Exit</button>
        </div>
      )}

      <main className={`app-main ${pathname === "/" || info.section === "journal" || info.section === "practice" || info.dayId ? "wide" : ""}`} id="main" aria-label={here?.label}>
        {children}
      </main>

      {info.showTabs && (
        <nav className="tabs no-print" aria-label="Sections">
          {tabs.map(({ id, label, href, Icon }) => (
            <Link key={id} href={href} className="tab" aria-current={info.section === id ? "page" : undefined}>
              <Icon />
              {label}
            </Link>
          ))}
        </nav>
      )}

      {drawer && (
        <Drawer
          onClose={() => setDrawer(false)}
          onSearch={() => { setDrawer(false); setSearch(true); }}
          onWelcome={() => { setDrawer(false); setWelcome(true); }}
        />
      )}
      {pocket && card && <PocketModal card={card} belt={info.pocket} pockets={pockets} onClose={() => setPocket(false)} />}
      {search && <SearchModal quiet={info.track?.id === "presence"} onClose={() => setSearch(false)} />}
      {welcome && <Welcome onClose={() => setWelcome(false)} />}
    </div>
  );
}
