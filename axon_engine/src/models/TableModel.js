const { createModel } = require('./BaseModel');

const base = createModel('tables', {
  jsonFields: ['headers', 'rows', 'visible_columns', 'filter_columns', 'additional'],
});

module.exports = {
  ...base,
};
