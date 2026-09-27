import { createModel } from '../models/BaseModel';
import { PRODUCT_TYPE_TABLE } from '../models/productType.model';

const base = createModel(PRODUCT_TYPE_TABLE, {
  jsonFields: ['field_schema'],
});

export default {
  ...base,
};
