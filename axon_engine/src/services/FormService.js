const AppError = require('../utils/AppError');
const FormModel = require('../models/FormModel');

async function list({ page, limit } = {}) {
  return FormModel.findPaginated({ page, limit });
}

async function show(id) {
  const form = await FormModel.findById(id);
  if (!form) throw new AppError(404, 'Form not found');
  return form;
}

module.exports = { list, show };
