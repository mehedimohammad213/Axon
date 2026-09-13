export const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Textarea" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" },
  { value: "date", label: "Date" },
  { value: "select", label: "Select" },
  { value: "media", label: "Media / Image" },
  { value: "phone", label: "Phone" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio" },
  { value: "multiselect", label: "Multi Select" },
  { value: "price", label: "Price" },
  { value: "richtext", label: "Rich Text" },
  { value: "file", label: "File Upload" },
  { value: "gallery", label: "Gallery" },
  { value: "color", label: "Color Picker" },
  { value: "range", label: "Range / Slider" },
  { value: "location", label: "Location" },
  { value: "rating", label: "Rating" },
  { value: "sku", label: "SKU / Barcode" },
  { value: "quantity", label: "Quantity / Stock" },
  { value: "toggle", label: "Toggle Switch" },
];

export function slugifyName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function slugifySlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createFieldFromPalette(element, index = 0) {
  const label = element.label || "Field";
  const fieldType = element.field_type || "text";
  let options = Array.isArray(element.options)
    ? element.options.map((option) => ({ ...option }))
    : [];

  if (
    ["select", "radio", "multiselect"].includes(fieldType) &&
    !options.some((option) => option.label || option.title || option.value)
  ) {
    options = getDefaultOptionsForFieldType(fieldType);
  }

  return {
    id: `field_${Date.now()}_${index}`,
    name: slugifyName(label) || `field_${index + 1}`,
    label,
    field_type: fieldType,
    required: false,
    placeholder: element.placeholder || "",
    options,
    show_in_list: true,
    currency: element.currency || "BDT",
    min: element.min ?? 0,
    max: element.max ?? (fieldType === "quantity" ? 9999 : 100),
    step: element.step ?? 1,
    max_rating: element.max_rating ?? 5,
    division_label: element.division_label || "Select Division",
    district_label: element.district_label || "Select District",
    updated_on: Date.now().toString(),
  };
}

export function parseFieldSchema(fieldSchema) {
  if (typeof fieldSchema === "string") {
    try {
      return JSON.parse(fieldSchema || "[]");
    } catch {
      return [];
    }
  }
  return Array.isArray(fieldSchema) ? fieldSchema : [];
}

export function normalizeFieldsForBuilder(fieldSchema) {
  return parseFieldSchema(fieldSchema).map((field, index) => ({
    ...field,
    id: field.id || `field_${index}`,
    updated_on: field.updated_on || `${field.id || index}`,
    options: Array.isArray(field.options) ? field.options : [],
    show_in_list: field.show_in_list !== false,
  }));
}

export function getListFields(productType) {
  return parseFieldSchema(productType?.field_schema).filter(
    (field) => field.show_in_list !== false
  );
}

export function getDefaultOptionsForFieldType(fieldType) {
  if (fieldType === "radio") {
    return [
      { label: "New", value: "new" },
      { label: "Used", value: "used" },
    ];
  }
  if (fieldType === "multiselect") {
    return [
      { label: "Tag 1", value: "tag_1" },
      { label: "Tag 2", value: "tag_2" },
      { label: "Tag 3", value: "tag_3" },
    ];
  }
  if (fieldType === "select") {
    return [
      { label: "Option 1", value: "option_1" },
      { label: "Option 2", value: "option_2" },
    ];
  }
  return [];
}

export function ensureFieldOptions(field) {
  const options = Array.isArray(field?.options) ? field.options : [];
  const valid = options.filter(
    (option) => option?.label || option?.title || option?.value
  );
  if (valid.length) {
    return valid.map((option) => ({
      label: option.label || option.title || option.value,
      value: option.value || slugifyName(option.label || option.title),
    }));
  }
  return getDefaultOptionsForFieldType(field?.field_type);
}

export function getFieldDisplayValue(product, fieldName) {
  const values = product?.field_values || {};
  const value = values[fieldName];
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") {
    if (value?.amount != null) {
      return `${value.currency || ""} ${value.amount}`.trim();
    }
    if (value?.division != null || value?.district != null) {
      return [value.division, value.district].filter(Boolean).join(" / ");
    }
    if (Array.isArray(value)) {
      return `${value.length} item${value.length === 1 ? "" : "s"}`;
    }
    if (value?.file_path) return value.file_path;
    if (value?.id) return `#${value.id}`;
    return JSON.stringify(value);
  }
  return String(value);
}
