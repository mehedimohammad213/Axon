import { createModel } from '../models/BaseModel';
import { TABLE_JSON_FIELDS, TABLE_TABLE } from '../models/table.model';

const base = createModel(TABLE_TABLE, {
  jsonFields: [...TABLE_JSON_FIELDS],
});

export default {
  ...base,
};
