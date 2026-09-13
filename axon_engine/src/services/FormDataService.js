const AppError = require('../utils/AppError');
const FormDataModel = require('../models/FormDataModel');

async function list({ page, limit, form_id } = {}) {
  return FormDataModel.findAllFilteredPaginated({ page, limit, formId: form_id });
}

async function show(id) {
  const item = await FormDataModel.findById(id);
  if (!item) throw new AppError(404, 'Form data not found');
  return item;
}

async function update(id, body) {
  const item = await FormDataModel.findById(id);
  if (!item) throw new AppError(404, 'Form data not found');

  return FormDataModel.updateStatus(id, body, item);
}

module.exports = { list, show, update };
