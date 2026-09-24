const { createModel } = require('./BaseModel');

const base = createModel('permissions', { scoped: false, active: true });

async function findAllOrdered() {
  const rows = await base.query().orderBy('sl_no', 'asc');
  return rows.map(base.expose);
}

module.exports = {
  ...base,
  findAll: findAllOrdered,
  findAllOrdered,
};
