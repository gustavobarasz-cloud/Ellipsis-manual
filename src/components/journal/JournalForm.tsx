"use client";
// Renders one journal spec. Every value saves inside that belt's own saved shape, so the original manuals'
// backups import straight into these fields and this app's backup keeps their field names.
import type { JField, JournalSpec, JSection } from "@/lib/types";
import { getAt, setAt, updateMaster, useMaster, type MasterState } from "@/lib/store";
import { getPath, setPath } from "@/lib/paths";

function Field({ f, value, onChange, placeholder }: { f: JField; value: any; onChange: (v: any) => void; placeholder?: string }) {
  const ph = placeholder ?? f.placeholder ?? "";
  if (f.check) {
    return (
      <label className="flex items-center gap-3 cursor-pointer" style={{ minHeight: 44 }}>
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={{ width: 22, height: 22, accentColor: "var(--track-accent)" }} />
        <span className="font-semibold">{f.label}</span>
      </label>
    );
  }
  if (f.options && f.options.length) {
    return (
      <label className="field">
        <span>{f.label}</span>
        <select className="select" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">Choose…</option>
          {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
    );
  }
  return (
    <label className="field">
      <span>{f.label}</span>
      {f.multi ? (
        <textarea className="textarea" value={value ?? ""} placeholder={ph} readOnly={f.readonly} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="input" value={value ?? ""} placeholder={ph} readOnly={f.readonly} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

const beltPath = (spec: JournalSpec, rel: string) => `belts.${spec.store}${rel ? "." + rel : ""}`;

function ListSpec({ spec, m }: { spec: JournalSpec; m: MasterState }) {
  const path = beltPath(spec, spec.list!);
  const rows: Record<string, any>[] = Array.isArray(getAt(m, path)) ? getAt(m, path) : [];
  const save = (next: Record<string, any>[]) => setAt(path, next);
  const add = () => save([{ date: new Date().toISOString().slice(0, 10) }, ...rows]);
  return (
    <div className="grid gap-3">
      <button type="button" className="btn sm justify-self-start" onClick={add}>Add an entry</button>
      {rows.length === 0 && <p className="text-sm muted">No entries yet.</p>}
      {rows.map((row, r) => (
        <div key={r} className="surface p-3 grid gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold muted">{row.date || `Entry ${rows.length - r}`}</span>
            <button type="button" className="btn sm danger" onClick={() => save(rows.filter((_, i) => i !== r))}>Delete</button>
          </div>
          {(spec.fields || []).map((f) => (
            <Field key={f.k} f={f} value={row[f.k]} onChange={(v) => save(rows.map((x, i) => (i === r ? { ...x, [f.k]: v } : x)))} />
          ))}
        </div>
      ))}
    </div>
  );
}

function Section({ spec, sec, m }: { spec: JournalSpec; sec: JSection; m: MasterState }) {
  if (sec.repeat) {
    const path = beltPath(spec, sec.repeat);
    const items: Record<string, any>[] = Array.isArray(getAt(m, path)) ? getAt(m, path) : [];
    const count = Math.max(sec.count || 1, items.length);
    const set = (n: number, k: string, v: any) =>
      updateMaster((s) => {
        const cur: any[] = Array.isArray(getPath(s, path)) ? [...getPath(s, path)] : [];
        while (cur.length <= n) cur.push({});
        cur[n] = { ...cur[n], [k]: v };
        return setPath(s, path, cur);
      });
    const canGrow = sec.growable && count < (sec.max || 20);
    return (
      <div className="grid gap-3">
        {sec.title && <h4 className="font-bold">{sec.title}</h4>}
        {Array.from({ length: count }, (_, n) => (
          <div key={n} className="surface p-3 grid gap-3">
            <p className="text-sm font-bold muted">{sec.itemTitles?.[n] || `${sec.itemTitle || "Item"} ${n + 1}`}</p>
            {sec.fields.map((f) => (
              <Field key={f.k} f={f} value={items[n]?.[f.k]} placeholder={sec.itemPlaceholders?.[n]?.[f.k]} onChange={(v) => set(n, f.k, v)} />
            ))}
          </div>
        ))}
        {canGrow && <button type="button" className="btn sm justify-self-start" onClick={() => set(count, sec.fields[0].k, "")}>Add another</button>}
      </div>
    );
  }
  return (
    <div className="grid gap-3">
      {sec.title && <h4 className="font-bold">{sec.title}</h4>}
      {sec.fields.map((f) => (
        <Field key={f.k} f={f} value={getAt(m, beltPath(spec, f.k))} onChange={(v) => setAt(beltPath(spec, f.k), v)} />
      ))}
    </div>
  );
}

export default function JournalForm({ spec, bare }: { spec: JournalSpec; bare?: boolean }) {
  const m = useMaster();
  const base = spec.path ? beltPath(spec, spec.path) : beltPath(spec, "");
  const body = (
    <div className="grid gap-4">
      {spec.help && <p className="help">{spec.help}</p>}
      {spec.tests && (
        <div className="grid gap-2">
          {spec.tests.map((t) => {
            const p = spec.store === "white" ? beltPath(spec, `chk_${t.k}`) : beltPath(spec, `capstone.${t.k}`);
            return (
              <div key={t.k} className="surface p-3">
                <label className="flex gap-3 items-start cursor-pointer">
                  <input type="checkbox" checked={!!getAt(m, p)} onChange={(e) => setAt(p, e.target.checked)} style={{ width: 22, height: 22, marginTop: 2, flex: "none", accentColor: "var(--track-accent)" }} />
                  <span>
                    <span className="font-bold block">{t.name}</span>
                    <span className="block text-[15px]"><strong>Setting:</strong> {t.setting}</span>
                    <span className="block text-[15px]"><strong>Pass:</strong> {t.pass}</span>
                  </span>
                </label>
              </div>
            );
          })}
          {spec.store !== "white" && (
            <Field f={{ k: "debrief", label: "Debrief", multi: true }} value={getAt(m, beltPath(spec, "capstone.debrief"))} onChange={(v) => setAt(beltPath(spec, "capstone.debrief"), v)} />
          )}
        </div>
      )}
      {spec.list ? (
        <ListSpec spec={spec} m={m} />
      ) : spec.sections ? (
        spec.sections.map((sec, i) => <Section key={i} spec={spec} sec={sec} m={m} />)
      ) : (
        (spec.tests && spec.store !== "white" ? [] : spec.fields || []).map((f) => (
          <Field key={f.k} f={f} value={getAt(m, `${base}.${f.k}`)} onChange={(v) => setAt(`${base}.${f.k}`, v)} />
        ))
      )}
    </div>
  );
  if (bare) return body;
  return (
    <section className="tool">
      <h3>{spec.title}</h3>
      {body}
    </section>
  );
}
