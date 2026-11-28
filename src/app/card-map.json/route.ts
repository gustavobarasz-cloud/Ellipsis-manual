// cardId → [href, title, where], for Share Card links (?card=<cardId>).
import { cardMap } from "@/lib/phase2";

export const dynamic = "force-static";

export function GET() {
  return Response.json(cardMap());
}
