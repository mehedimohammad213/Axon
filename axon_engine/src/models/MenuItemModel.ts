import { createModel } from './BaseModel';

const base = createModel('menu_items');

async function createMany(items: Record<string, any>[]) {
  const created: Record<string, any>[] = [];
  for (const item of items) {
    const row = await base.create({
      title: item.title,
      title_bn: item.title_bn || null,
      link: item.link,
      parent_id: item.parent_id || null,
    });
    created.push(row);
  }
  return created;
}

export default {
  ...base,
  createMany,
};
