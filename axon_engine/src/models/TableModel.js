const { createModel } = require('./BaseModel');

const base = createModel('tables', {
  jsonFields: ['headers', 'rows', 'visible_columns', 'filter_columns', 'additional'],
  active: true,
});

module.exports = {
  ...base,
};
