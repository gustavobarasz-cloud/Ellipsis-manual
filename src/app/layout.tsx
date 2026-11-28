import type { Metadata, Viewport } from "next";
import { Archivo, Bevan } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/shell/AppShell";
import { navMap } from "@/lib/nav";
import { EXTRAS } from "@/lib/content";

const bevan = Bevan({ subsets: ["latin"], weight: "400", variable: "--font-bevan", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });

export const metadata: Metadata = {
  title: "The Dojo · Ellipsis Manual & Communication Mastery",
  description: "Behavioral Profiling & Influence, Communication Mastery (White → Black Belt) and Intimacy & Presence, in one app.",
  manifest: "/manifest.webmanifest",
  applicationName: "The Dojo",
  appleWebApp: { capable: true, title: "The Dojo", statusBarStyle: "default" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4ECDC" },
    { media: "(prefers-color-scheme: dark)", color: "#15181F" },
  ],
};

// Applies the saved theme before first paint so dark mode never flashes light.
const THEME_SCRIPT = `try{var s=JSON.parse(localStorage.getItem("dojo_settings_v1")||"{}");var t=s.theme||"system";if(t==="system")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t;}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bevan.variable} ${archivo.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <AppShell nav={navMap()} pockets={EXTRAS.pockets}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
