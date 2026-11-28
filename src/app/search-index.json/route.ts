// The cross-door search index, built once at build time and fetched the first time search opens.
import { searchIndex, threadViews } from "@/lib/phase2";

export const dynamic = "force-static";

export function GET() {
  return Response.json({ v: 1, docs: searchIndex(), threads: threadViews() });
}
