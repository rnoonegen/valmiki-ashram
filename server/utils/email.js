function normalizeEmail(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

/** Lightweight format check (aligned with typical HTML5 email validation). */
function isValidEmail(value) {
  const s = normalizeEmail(value);
  if (!s) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

module.exports = { normalizeEmail, isValidEmail };
