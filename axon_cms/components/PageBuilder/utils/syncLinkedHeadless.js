const HEADLESS_KEY_MAP = {
  card: "cards_headless",
  footer: "footers_headless",
  media: "medias_headless",
  menu: "menus_headless",
  navbar: "navbars_headless",
  slider: "sliders_headless",
  table: "tables_headless",
};

const PRESERVE_HEADLESS_KEYS = [
  "altTitle",
  "altDescription",
  "altContent",
  "showAltContent",
  "config",
];

const normalizeComponentType = (component) => {
  if (!component?.type) return null;
  return typeof component.type === "object"
    ? component.type.type || null
    : component.type;
};

const preserveHeadlessOverrides = (existingHeadless, freshHeadless) => {
  if (!freshHeadless) return existingHeadless ?? null;

  const preserved = {};
  if (existingHeadless) {
    for (const key of PRESERVE_HEADLESS_KEYS) {
      if (existingHeadless[key] !== undefined) {
        preserved[key] = existingHeadless[key];
      }
    }
  }

  return { ...freshHeadless, ...preserved };
};

const findHeadlessData = (pageData, type, id) => {
  const key = HEADLESS_KEY_MAP[type];
  if (!key || !Array.isArray(pageData[key])) return null;

  return (
    pageData[key].find((item) => String(item.id) === String(id)) ?? null
  );
};

const syncComponentHeadless = (pageData, component) => {
  if (!component?.id) return component;

  const type = normalizeComponentType(component);
  if (!type || !HEADLESS_KEY_MAP[type]) return component;

  const freshHeadless = findHeadlessData(pageData, type, component.id);
  if (!freshHeadless) return component;

  return {
    ...component,
    _headless: preserveHeadlessOverrides(component._headless, freshHeadless),
  };
};

const syncComponentsInTree = (pageData, components) => {
  if (!Array.isArray(components)) return components;

  return components.map((component) => {
    const isRootContainer =
      Object.prototype.hasOwnProperty.call(component, "_category") &&
      component._category === "root";

    if (isRootContainer && Array.isArray(component.data)) {
      return {
        ...component,
        data: syncComponentsInTree(pageData, component.data),
      };
    }

    let synced = syncComponentHeadless(pageData, component);

    if (Array.isArray(synced.data)) {
      synced = {
        ...synced,
        data: syncComponentsInTree(pageData, synced.data),
      };
    }

    return synced;
  });
};

export const syncLinkedHeadless = (pageData) => {
  if (!pageData?.body || !Array.isArray(pageData.body)) return pageData;

  return {
    ...pageData,
    body: pageData.body.map((section) => ({
      ...section,
      data: syncComponentsInTree(pageData, section.data),
    })),
  };
};

export default syncLinkedHeadless;
