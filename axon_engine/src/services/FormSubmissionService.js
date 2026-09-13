const AppError = require('../utils/AppError');
const FormSubmissionModel = require('../models/FormSubmissionModel');

async function list({ form_id, form_type, page, limit } = {}) {
  return FormSubmissionModel.findAllFilteredPaginated({ form_id, form_type, page, limit });
}

async function create(body) {
  const submission = await FormSubmissionModel.createSubmission(body);
  return { message: 'Form submitted successfully', data: submission };
}

async function update(id, body) {
  const item = await FormSubmissionModel.findById(id);
  if (!item) throw new AppError(404, 'Submission not found');

  const updated = await FormSubmissionModel.updateSubmission(id, body, item);
  return { message: 'Submission updated', data: updated };
}

async function remove(id) {
  await FormSubmissionModel.remove(id);
  return 'Form submission';
}

module.exports = { list, create, update, remove };
