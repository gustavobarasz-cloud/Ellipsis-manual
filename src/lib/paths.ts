// Dotted-path helpers for the saved state ("br1.asks.0.orig").
export function getPath(obj: any, path: string): any {
  if (!path) return obj;
  let cur = obj;
  for (const k of path.split(".")) {
    if (cur == null) return undefined;
    cur = cur[k];
  }
  return cur;
}

export function setPath<T>(obj: T, path: string, value: any): T {
  const keys = path.split(".");
  const root: any = Array.isArray(obj) ? [...(obj as any)] : { ...(obj as any) };
  let cur = root;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const nextIsIndex = /^\d+$/.test(keys[i + 1]);
    const v = cur[k];
    cur[k] = v == null ? (nextIsIndex ? [] : {}) : Array.isArray(v) ? [...v] : { ...v };
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return root;
}
