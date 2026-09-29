// components/slider/SliderForm/orderByIds.js

export const orderByIds = (items = [], ids = []) => {
  if (!ids?.length || !items?.length) return items || [];

  const itemMap = Object.fromEntries(
    items.map((item) => [String(item.id), item])
  );
  const ordered = ids.map((id) => itemMap[String(id)]).filter(Boolean);
  const seen = new Set(ordered.map((item) => String(item.id)));

  items.forEach((item) => {
    if (!seen.has(String(item.id))) {
      ordered.push(item);
    }
  });

  return ordered;
};
