"use client";
// One Edit button per card. Saving keeps the change in this browser (dojo_content_overrides_v1);
// Reset brings back the migrated text.
import { useEffect, useState } from "react";
import { setSettings, useContentCard, useSettings } from "@/lib/store";
import Md from "./Md";

export default function EditableCardBody({ cardId, title, md }: { cardId: string; title: string; md: string }) {
  const { content, edited, editedAt, save, reset } = useContentCard(cardId, md);
  const { editMode } = useSettings();
  const [local, setLocal] = useState(false);
  const editing = local || editMode;
  const setEditing = (v: boolean) => {
    setLocal(v);
    if (!v && editMode) setSettings({ editMode: false });
  };
  const [draft, setDraft] = useState(content);

  useEffect(() => {
    if (!editing) setDraft(content);
  }, [content, editing]);
  useEffect(() => setLocal(false), [cardId]);

  if (editing) {
    return (
      <div data-editing="true">
        <label className="field">
          <span>Edit this card</span>
          <textarea
            className="textarea"
            style={{ minHeight: "50vh", fontFamily: "ui-monospace, monospace", fontSize: 15 }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
        </label>
        <p className="text-sm muted mt-2">
          Markdown: **bold**, *italic*, &quot;- &quot; lists, ## headings. Keep the :::dialect and :::field lines as they are.
        </p>
        <div className="btn-row mt-3">
          <button type="button" className="btn primary" onClick={() => { save(draft, title); setEditing(false); }}>Save</button>
          <button type="button" className="btn" onClick={() => { setDraft(content); setEditing(false); }}>Cancel</button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3 no-print">
        {edited && (
          <span className="badge edited-badge" title={editedAt ? `Edited ${new Date(editedAt).toLocaleString()}` : undefined}>Edited</span>
        )}
        <span className="flex-1" />
        {edited && <button type="button" className="btn sm danger" onClick={reset}>Reset</button>}
        <button type="button" className="btn sm" onClick={() => setEditing(true)} aria-label={`Edit card: ${title}`}>Edit</button>
      </div>
      <Md md={content} cardId={cardId} />
    </div>
  );
}
