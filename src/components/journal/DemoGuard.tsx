"use client";
// The v2 site's Loop, Kit and Pit tools keep their own saves. In Demo Mode they are not shown at all,
// so Demo can never reveal or overwrite them.
import { useReady, useSettings } from "@/lib/store";

export default function DemoGuard({ children, what }: { children: React.ReactNode; what: string }) {
  const { demo } = useSettings();
  const ready = useReady();
  if (!ready) return null;
  if (demo) {
    return (
      <div className="surface p-4">
        <p className="font-semibold">{what} is hidden in Demo Mode.</p>
        <p className="text-sm muted mt-1">Turn Demo Mode off in the ⋯ menu to see and edit it.</p>
      </div>
    );
  }
  return <>{children}</>;
}
