import { createModel } from '../models/BaseModel';
import { FORM_BUILDER_JSON_FIELDS, FORM_BUILDER_TABLE } from '../models/formBuilder.model';

const base = createModel(FORM_BUILDER_TABLE, {
  jsonFields: [...FORM_BUILDER_JSON_FIELDS],
});

export default {
  ...base,
};
