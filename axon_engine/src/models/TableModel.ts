import { createModel } from './BaseModel';

const base = createModel('tables', {
  jsonFields: ['headers', 'rows', 'visible_columns', 'filter_columns', 'additional'],
});

export default {
  ...base,
};
