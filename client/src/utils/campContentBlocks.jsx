export function normalizeContentBlock(block, options = {}) {
  const { allowImplicitBullets = false } = options;
  if (!block || typeof block !== "object") return null;

  const type = block.type;
  if (!type && allowImplicitBullets && Array.isArray(block.items)) {
    return normalizeContentBlock({ ...block, type: "bullets" }, options);
  }

  if (type === "subheading") {
    const text = typeof block.text === "string" ? block.text.trim() : "";
    return text ? { type: "subheading", text } : null;
  }

  if (type === "bullets") {
    const items = Array.isArray(block.items)
      ? block.items.map((item) => (typeof item === "string" ? item.trim() : String(item).trim())).filter(Boolean)
      : [];
    return items.length ? { type: "bullets", items } : null;
  }

  const text = typeof block.text === "string" ? block.text.trim() : "";
  return text ? { type: "paragraph", text } : null;
}

export function sanitizeContentBlocks(blocks, options = {}) {
  return (blocks || []).map((block) => normalizeContentBlock(block, options)).filter(Boolean);
}

export function resolveContentBlocks(raw, key, fallback, legacyKey, options = {}) {
  const merged = { ...(raw || {}) };
  const fromApi = merged[key];
  if (Array.isArray(fromApi) && fromApi.length > 0) {
    const normalized = sanitizeContentBlocks(fromApi, options);
    if (normalized.length > 0) return normalized;
  }
  if (legacyKey && merged[legacyKey] && String(merged[legacyKey]).trim()) {
    return [{ type: "paragraph", text: String(merged[legacyKey]).trim() }];
  }
  return fallback || [];
}

export function renderContentBlocks(blocks, keyPrefix, firstMargin = "mt-4") {
  return (blocks || []).map((block, bi) => {
    const pCls = bi === 0 ? `${firstMargin} text-base leading-8 text-prose-muted` : "mt-2 text-base leading-8 text-prose-muted";
    const hCls = bi === 0 ? `${firstMargin} text-lg font-semibold text-prose` : "mt-5 text-lg font-semibold text-prose";
    const uCls = bi === 0 ? `${firstMargin} list-disc space-y-2 pl-6 text-prose-muted` : "mt-5 list-disc space-y-2 pl-6 text-prose-muted";

    if (block.type === "subheading") {
      return (
        <p key={`${keyPrefix}-${bi}`} className={hCls}>
          {block.text}
        </p>
      );
    }
    if (block.type === "bullets") {
      return (
        <ul key={`${keyPrefix}-${bi}`} className={uCls}>
          {(block.items || []).map((item, i) => (
            <li key={`${keyPrefix}-${bi}-${i}`}>{item}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={`${keyPrefix}-${bi}`} className={pCls}>
        {block.text}
      </p>
    );
  });
}
