"use client";
import React from "react";
import {
  M01Simulator,
  M02Simulator,
  M03Simulator,
  M04Simulator,
  M05Simulator,
  M06Simulator,
} from "./SimulatorsT1T3";
import {
  M07Simulator,
  M08Simulator,
  M09Simulator,
  M10Simulator,
} from "./SimulatorsT4T5";
import { M11Simulator, M12Simulator } from "./SimulatorsT6";

export const SIMULATOR_REGISTRY = {
  M01: M01Simulator,
  M02: M02Simulator,
  M03: M03Simulator,
  M04: M04Simulator,
  M05: M05Simulator,
  M06: M06Simulator,
  M07: M07Simulator,
  M08: M08Simulator,
  M09: M09Simulator,
  M10: M10Simulator,
  M11: M11Simulator,
  M12: M12Simulator,
};

export function ModuleSimulator({ moduleId, diagramSpec }) {
  const SimComponent = SIMULATOR_REGISTRY[moduleId];
  if (SimComponent) {
    return <SimComponent />;
  }

  // Schema-driven fallback for any future imported modules
  if (!diagramSpec) return null;
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-3">
      <div className="text-[11px] font-mono uppercase tracking-widest text-violet-400">
        {moduleId} Blueprint · {diagramSpec.type}
      </div>
      <h4 className="text-base font-semibold text-slate-100">{diagramSpec.title}</h4>
      <p className="text-xs text-slate-400 leading-relaxed">{diagramSpec.description}</p>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {(diagramSpec.interactiveVariables || []).map((v) => (
          <span
            key={v}
            className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-mono text-slate-300"
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}
