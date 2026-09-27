import { createModel } from '../models/BaseModel';
import { MENU_ITEM_TABLE } from '../models/menuItem.model';

const base = createModel(MENU_ITEM_TABLE);

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
