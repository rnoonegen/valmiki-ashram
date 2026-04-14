/**
 * Collect leaf validation messages from react-hook-form's `errors` object
 * (nested FieldError trees, arrays, etc.).
 */
export function flattenRhfErrorMessages(errors) {
  const out = [];
  const walk = (node) => {
    if (node == null) return;
    if (typeof node !== 'object') return;
    if (typeof node.message === 'string' && node.message) {
      out.push(node.message);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    Object.values(node).forEach(walk);
  };
  walk(errors);
  return out;
}
