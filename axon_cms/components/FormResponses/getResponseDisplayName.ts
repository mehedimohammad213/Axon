/**
 * Resolve a display name from form_data across common field shapes.
 * Contact forms often use firstName/lastName instead of a single name field.
 */
export function getResponseDisplayName(formData) {
  if (!formData || typeof formData !== "object") return "";

  const direct =
    formData.name ||
    formData.full_name ||
    formData.fullName ||
    formData.Name ||
    formData.contact_name;

  if (direct && String(direct).trim()) {
    return String(direct).trim();
  }

  const first =
    formData.firstName ||
    formData.first_name ||
    formData.FirstName ||
    "";
  const last =
    formData.lastName ||
    formData.last_name ||
    formData.LastName ||
    "";
  const combined = `${first} ${last}`.trim();

  return combined;
}
