const AppError = require('../utils/AppError');
const { createModel } = require('../models/BaseModel');

function createCrudService(tableName, options = {}) {
  const model = createModel(tableName, options);
  const requiredOnCreate = options.requiredOnCreate || [];

  async function list({ page, limit } = {}) {
    return model.findPaginated({ page, limit });
  }

  async function show(id) {
    const item = await model.findById(id);
    if (!item) throw new AppError(404, `${tableName} not found`);
    return item;
  }

  async function create(body) {
    for (const field of requiredOnCreate) {
      if (!body[field]) {
        throw new AppError(422, 'Validation failed', {
          [field]: [`The ${field} field is required.`],
        });
      }
    }

    return model.create(body);
  }

  async function update(id, body) {
    const item = await model.findById(id);
    if (!item) throw new AppError(404, `${tableName} not found`);

    return model.update(id, body);
  }

  async function remove(id) {
    const item = await model.findById(id);
    if (!item) throw new AppError(404, `${tableName} not found`);

    await model.remove(id);
    return tableName;
  }

  return { list, show, create, update, remove };
}

module.exports = { createCrudService };
