/**
 * Extract page id from a menu item link that uses ?pageId= / ?page_id=
 * e.g. /about/team?pageId=12&pageName=team
 */
export const pageIdFromMenuLink = (link) => {
  if (!link || typeof link !== "string") return null;
  const query = link.includes("?") ? link.split("?")[1] : "";
  if (!query) return null;
  try {
    const params = new URLSearchParams(query);
    return params.get("pageId") ?? params.get("page_id");
  } catch {
    return null;
  }
};

const normalizePath = (link) => {
  if (!link || typeof link !== "string") return "";
  if (/^https?:\/\//i.test(link) || link.startsWith("#")) return "";
  const pathOnly = link.split("?")[0].split("#")[0].trim();
  if (!pathOnly) return "";
  const withLeading = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  return withLeading.replace(/\/+$/, "") || "/";
};

/**
 * Match path-only menu links (no pageId) to a page slug.
 * e.g. /about → about, / → home
 */
export const pathMatchesPageSlug = (link, slug) => {
  const path = normalizePath(link);
  if (!path || !slug) return false;

  const normalizedSlug = String(slug)
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
  if (!normalizedSlug) return false;

  const pathLower = path.toLowerCase();

  if (normalizedSlug === "home") {
    return pathLower === "/" || pathLower === "/home";
  }

  return (
    pathLower === `/${normalizedSlug}` ||
    pathLower.endsWith(`/${normalizedSlug}`)
  );
};

export const menuItemLinksToPage = (menuItem, page) => {
  if (!menuItem || !page) return false;
  const linkedPageId = pageIdFromMenuLink(menuItem.link);

  // Prefer explicit pageId when present
  if (linkedPageId) {
    return String(linkedPageId) === String(page.id);
  }

  // Older / path-only links: /about, /contact, /
  return pathMatchesPageSlug(menuItem.link, page.slug);
};

/**
 * Find all menu items linked to a page (by pageId query or path/slug).
 */
export const getLinkedMenuItems = (menuItems = [], page) => {
  if (!page) return [];
  return menuItems.filter((item) => menuItemLinksToPage(item, page));
};

/**
 * Group menu items by linked page id for O(1) card lookups.
 * Only includes items that have an explicit pageId in the link.
 * @returns {Map<string, Array>}
 */
export const groupMenuItemsByPageId = (menuItems = []) => {
  const byPageId = new Map();

  menuItems.forEach((item) => {
    const pageId = pageIdFromMenuLink(item?.link);
    if (!pageId) return;
    const key = String(pageId);
    const existing = byPageId.get(key) || [];
    existing.push(item);
    byPageId.set(key, existing);
  });

  return byPageId;
};

export const getMenuItemsForPage = (menuItemsByPageId, pageId) => {
  if (!menuItemsByPageId || pageId == null) return [];
  return menuItemsByPageId.get(String(pageId)) || [];
};
