import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

export default function ContentBlockEditor({
  title,
  hint,
  blocks,
  onChange,
  keyPrefix,
  sectionTitle,
  sectionHint,
  onBlocksChange,
  blockKeyPrefix,
}) {
  const resolvedTitle = title || sectionTitle;
  const resolvedHint = hint || sectionHint;
  const resolvedBlocks = blocks || [];
  const resolvedOnChange = onChange || onBlocksChange;
  const resolvedKeyPrefix = keyPrefix || blockKeyPrefix || "content-block";

  return (
    <div className="mt-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
      <h4 className="text-sm font-semibold text-prose">{resolvedTitle}</h4>
      {resolvedHint ? <p className="mt-1 text-xs text-prose-muted">{resolvedHint}</p> : null}
      <div className="mt-3 space-y-4">
        {resolvedBlocks.map((block, bi) => (
          <div
            key={`${resolvedKeyPrefix}-${bi}`}
            className="rounded-lg border border-neutral-100 bg-neutral-50/80 p-3 dark:border-neutral-800 dark:bg-neutral-900/50"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-prose-muted">
                {block.type === "paragraph" ? "Paragraph" : block.type === "subheading" ? "Subheading" : "Bullet list"}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={bi === 0}
                  onClick={() => {
                    if (bi === 0) return;
                    const next = [...resolvedBlocks];
                    [next[bi - 1], next[bi]] = [next[bi], next[bi - 1]];
                    resolvedOnChange(next);
                  }}
                  className="rounded-md border border-neutral-300 p-1.5 disabled:opacity-40 dark:border-neutral-600"
                  aria-label="Move block up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={bi === resolvedBlocks.length - 1}
                  onClick={() => {
                    if (bi === resolvedBlocks.length - 1) return;
                    const next = [...resolvedBlocks];
                    [next[bi], next[bi + 1]] = [next[bi + 1], next[bi]];
                    resolvedOnChange(next);
                  }}
                  className="rounded-md border border-neutral-300 p-1.5 disabled:opacity-40 dark:border-neutral-600"
                  aria-label="Move block down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => resolvedOnChange(resolvedBlocks.filter((_, i) => i !== bi))}
                  className="rounded-md bg-rose-600 p-1.5 text-white"
                  aria-label="Remove block"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {block.type === "paragraph" ? (
              <textarea
                className="h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                value={block.text || ""}
                onChange={(e) =>
                  resolvedOnChange(resolvedBlocks.map((b, i) => (i === bi ? { ...b, text: e.target.value } : b)))
                }
              />
            ) : null}
            {block.type === "subheading" ? (
              <input
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                value={block.text || ""}
                onChange={(e) =>
                  resolvedOnChange(resolvedBlocks.map((b, i) => (i === bi ? { ...b, text: e.target.value } : b)))
                }
              />
            ) : null}
            {block.type === "bullets" ? (
              <div className="space-y-2">
                {(block.items || []).map((line, li) => (
                  <div key={`${resolvedKeyPrefix}-${bi}-li-${li}`} className="flex gap-2">
                    <input
                      className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                      value={line}
                      onChange={(e) =>
                        resolvedOnChange(
                          resolvedBlocks.map((b, i) => {
                            if (i !== bi) return b;
                            const items = [...(b.items || [])];
                            items[li] = e.target.value;
                            return { ...b, items };
                          })
                        )
                      }
                    />
                    <button
                      type="button"
                      className="rounded-md bg-rose-600 p-2 text-white"
                      onClick={() =>
                        resolvedOnChange(
                          resolvedBlocks.map((b, i) =>
                            i !== bi ? b : { ...b, items: (b.items || []).filter((_, j) => j !== li) }
                          )
                        )
                      }
                      aria-label="Remove bullet"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-xs font-medium text-accent dark:text-emerald-200"
                  onClick={() =>
                    resolvedOnChange(
                      resolvedBlocks.map((b, i) => (i !== bi ? b : { ...b, items: [...(b.items || []), ""] }))
                    )
                  }
                >
                  + Add bullet
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => resolvedOnChange([...resolvedBlocks, { type: "paragraph", text: "" }])}
          className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-2 py-1.5 text-xs dark:border-neutral-600"
        >
          <Plus className="h-3.5 w-3.5" /> Paragraph
        </button>
        <button
          type="button"
          onClick={() => resolvedOnChange([...resolvedBlocks, { type: "subheading", text: "" }])}
          className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-2 py-1.5 text-xs dark:border-neutral-600"
        >
          <Plus className="h-3.5 w-3.5" /> Subheading
        </button>
        <button
          type="button"
          onClick={() => resolvedOnChange([...resolvedBlocks, { type: "bullets", items: [""] }])}
          className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-2 py-1.5 text-xs dark:border-neutral-600"
        >
          <Plus className="h-3.5 w-3.5" /> Bullet list
        </button>
      </div>
    </div>
  );
}
