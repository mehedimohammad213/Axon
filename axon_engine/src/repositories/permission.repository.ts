import { createModel } from '../models/BaseModel';
import { PERMISSION_TABLE } from '../models/permission.model';

const base = createModel(PERMISSION_TABLE, { scoped: false });

async function findAllOrdered() {
  return base.query().orderBy('sl_no', 'asc');
}

export default {
  ...base,
  findAll: findAllOrdered,
  findAllOrdered,
};
