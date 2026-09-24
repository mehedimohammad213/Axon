const { createModel } = require('./BaseModel');

module.exports = createModel('product_types', {
  jsonFields: ['field_schema'],
  active: true,
});
