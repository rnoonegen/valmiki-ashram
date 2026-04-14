import { z } from 'zod';

/** Trim and lowercase for consistent storage and comparison. */
export function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function isValidEmail(value) {
  const n = normalizeEmail(value);
  if (!n) return false;
  return z.string().email().safeParse(n).success;
}

/** Required contact email: normalize then validate. */
export function zodRequiredEmail(message = 'Enter a valid email') {
  return z
    .string()
    .transform((s) => normalizeEmail(s))
    .pipe(z.string().min(1, 'Email is required').email(message));
}

/** Optional email: empty allowed; otherwise must be valid. */
export function zodOptionalEmail(message = 'Enter a valid email') {
  return z
    .string()
    .transform((s) => normalizeEmail(s))
    .refine((s) => !s || z.string().email().safeParse(s).success, { message });
}

export function getCampYearBounds(now = new Date()) {
  const y = now.getFullYear();
  return { min: y, max: y + 5 };
}

/**
 * Allowed camp years for admin select: current … current+5.
 * If stored year is a 4-digit value outside that window, it is listed first so legacy rows stay editable.
 */
export function buildCampYearSelectYears(storedRaw, bounds = getCampYearBounds()) {
  const { min, max } = bounds;
  const allowed = [];
  for (let y = min; y <= max; y += 1) allowed.push(y);
  const raw = String(storedRaw ?? '').trim();
  const n = /^\d{4}$/.test(raw) ? Number(raw) : NaN;
  if (Number.isInteger(n) && !allowed.includes(n)) {
    return { allowed, legacyYears: [n] };
  }
  return { allowed, legacyYears: [] };
}

export function parseCampYearForSave(rawYear, bounds = getCampYearBounds()) {
  const raw = String(rawYear ?? '').trim();
  const y = /^\d{4}$/.test(raw) ? Number(raw) : NaN;
  const { min, max } = bounds;
  if (!Number.isInteger(y) || y < min || y > max) {
    return { ok: false, year: null, min, max };
  }
  return { ok: true, year: String(y), min, max };
}
