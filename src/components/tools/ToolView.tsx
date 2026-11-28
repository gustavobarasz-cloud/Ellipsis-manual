"use client";
import type { JournalMap, ToolSpec } from "@/lib/types";
import type { GridMap } from "./types";
import Deck from "./Deck";
import Rungs from "./Rungs";
import Drill from "./Drill";
import Timer from "./Timer";
import Linter from "./Linter";
import JournalForm from "@/components/journal/JournalForm";
import BodyMap from "./BodyMap";
import Grid from "./Grid";
import Marker from "./Marker";
import Evidence from "./Evidence";
import FaceWeight from "./FaceWeight";
import Radar from "./Radar";
import Legacy from "./Legacy";

export default function ToolView({ id, spec, journal, grids, quiet }: { id: string; spec: ToolSpec; journal: JournalMap; grids: GridMap; quiet?: boolean }) {
  switch (spec.type) {
    case "deck": return <Deck spec={spec} />;
    case "rungs": return <Rungs spec={spec} quiet={quiet} />;
    case "drill": return <Drill spec={spec} id={id} />;
    case "timer": return <Timer spec={spec} />;
    case "linter": return <Linter spec={spec} />;
    case "form": return journal[spec.journal] ? <JournalForm spec={journal[spec.journal]} /> : null;
    case "bodymap": return <BodyMap spec={spec} />;
    case "grid": return grids[spec.belt] ? <Grid belt={spec.belt} grid={grids[spec.belt]} /> : null;
    case "marker": return <Marker spec={spec} />;
    case "evidence": return <Evidence spec={spec} />;
    case "faceweight": return <FaceWeight />;
    case "radar": return <Radar />;
    case "legacy": return <Legacy spec={spec} />;
    default: return null;
  }
}
