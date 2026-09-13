const { createModel } = require('./BaseModel');

const base = createModel('permissions', { scoped: false });

async function findAllOrdered() {
  return base.query().orderBy('sl_no', 'asc');
}

module.exports = {
  ...base,
  findAll: findAllOrdered,
  findAllOrdered,
};
