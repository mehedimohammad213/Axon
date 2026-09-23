const getPageType = (page) => {
  if (!page) return "Page";
  if (page.type) return page.type;
  const additional = Array.isArray(page.additional)
    ? page.additional[0]
    : page.additional;
  return additional?.pageType || "Page";
};

export const getPageListPath = (page) => {
  const type = String(getPageType(page) || "").toLowerCase();
  if (type === "footer") return "/footers";
  return "/pages";
};
