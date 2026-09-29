export function isImageCellValue(value) {
  if (!value || typeof value !== "string") return false;

  const trimmed = value.trim();
  if (!trimmed) return false;

  // Absolute or protocol-relative URLs with image extensions
  if (/\.(jpe?g|png|gif|webp|svg|bmp|avif)(\?.*)?$/i.test(trimmed)) {
    return true;
  }

  // Uploaded media paths commonly used in this CMS
  if (
    /(^|\/)(uploads|media)\//i.test(trimmed) &&
    !/\.(pdf|docx?|xlsx?|pptx?|zip|mp4|webm|mp3)(\?.*)?$/i.test(trimmed)
  ) {
    return true;
  }

  return false;
}

export function toHeadlessTable(table = {}) {
  const headers = Array.isArray(table.headers) ? table.headers : [];
  const rows = Array.isArray(table.rows) ? table.rows : [];
  const visibleColumns =
    table.visibleColumns ??
    table.visible_columns ??
    (headers.length ? headers.map(() => true) : []);
  const filterColumns = table.filterColumns ?? table.filter_columns ?? [];

  return {
    id: table.id,
    title_en: table.title_en || "",
    title_bn: table.title_bn || "",
    page_name: table.page_name || "",
    headers,
    rows,
    visibleColumns,
    filterColumns,
    additional: table.additional || {},
    status: table.status ?? true,
  };
}

export function toApiPayload(data = {}) {
  return {
    title_en: data.title_en || "Untitled Table",
    title_bn: data.title_bn || data.title_en || "Untitled Table",
    page_name: data.page_name || null,
    headers: data.headers || [],
    rows: data.rows || [],
    visible_columns: data.visibleColumns ?? data.visible_columns ?? [],
    filter_columns: data.filterColumns ?? data.filter_columns ?? [],
    additional: data.additional || {},
    status: data.status === false || data.status === 0 ? false : true,
  };
}

export function getTableStats(table = {}) {
  const headers = Array.isArray(table.headers) ? table.headers : [];
  const rows = Array.isArray(table.rows) ? table.rows : [];
  return {
    columnCount: headers.length,
    rowCount: rows.length,
  };
}
