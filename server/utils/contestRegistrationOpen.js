/**
 * Ensures API payloads always expose registrationOpen and omit legacy isPublished
 * if it still exists in raw Mongo documents.
 */
function isRegistrationOpen(doc) {
  if (!doc) return false;
  const v =
    typeof doc.get === "function"
      ? doc.get("registrationOpen")
      : doc.registrationOpen;
  return v !== false;
}

function attachRegistrationOpen(lean) {
  if (!lean) return null;
  const { isPublished: _legacy, ...rest } = lean;
  return { ...rest, registrationOpen: lean.registrationOpen !== false };
}

module.exports = { isRegistrationOpen, attachRegistrationOpen };
