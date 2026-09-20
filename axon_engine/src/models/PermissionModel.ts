import { createModel } from './BaseModel';

const base = createModel('permissions', { scoped: false });

async function findAllOrdered() {
  return base.query().orderBy('sl_no', 'asc');
}

export default {
  ...base,
  findAll: findAllOrdered,
  findAllOrdered,
};
