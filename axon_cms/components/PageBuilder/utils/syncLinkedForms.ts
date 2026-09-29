const FORM_PRESERVE_KEYS = [
  "altTitle",
  "altDescription",
  "showAltContent",
];

const collectFormIds = (components, ids = new Set()) => {
  if (!Array.isArray(components)) return ids;

  for (const component of components) {
    const type =
      typeof component?.type === "object"
        ? component.type?.type
        : component?.type;

    if (type === "form" && component?.data?.formId) {
      ids.add(component.data.formId);
    }

    if (Array.isArray(component?.data)) {
      collectFormIds(component.data, ids);
    }
  }

  return ids;
};

const preserveFormDataOverrides = (existingData, freshData) => {
  if (!freshData) return existingData ?? null;

  const preserved = {};
  if (existingData) {
    for (const key of FORM_PRESERVE_KEYS) {
      if (existingData[key] !== undefined) {
        preserved[key] = existingData[key];
      }
    }
  }

  return {
    ...freshData,
    formId: freshData.id ?? existingData?.formId,
    ...preserved,
  };
};

const syncFormComponentsInTree = (components, formsById) => {
  if (!Array.isArray(components)) return components;

  return components.map((component) => {
    const type =
      typeof component?.type === "object"
        ? component.type?.type
        : component?.type;

    let synced = component;

    if (type === "form" && component?.data?.formId) {
      const freshForm = formsById[component.data.formId];
      if (freshForm) {
        synced = {
          ...component,
          _headless: true,
          data: preserveFormDataOverrides(component.data, {
            formId: freshForm.id,
            title: freshForm.title,
            description: freshForm.description,
            elements: freshForm.elements,
            attributes: freshForm.attributes,
          }),
        };
      }
    }

    if (Array.isArray(synced.data)) {
      synced = {
        ...synced,
        data: syncFormComponentsInTree(synced.data, formsById),
      };
    }

    return synced;
  });
};

export const syncLinkedForms = async (pageData, fetchForms) => {
  if (!pageData?.body || !Array.isArray(pageData.body)) return pageData;

  const formIds = new Set();
  for (const section of pageData.body) {
    collectFormIds(section?.data, formIds);
  }

  if (formIds.size === 0) return pageData;

  try {
    const forms = await fetchForms();
    if (!Array.isArray(forms)) return pageData;

    const formsById = Object.fromEntries(
      forms
        .filter((form) => formIds.has(form.id))
        .map((form) => [form.id, form])
    );

    return {
      ...pageData,
      body: pageData.body.map((section) => ({
        ...section,
        data: syncFormComponentsInTree(section.data, formsById),
      })),
    };
  } catch (error) {
    console.error("Failed to sync linked forms:", error);
    return pageData;
  }
};

export default syncLinkedForms;
