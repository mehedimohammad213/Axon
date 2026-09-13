const createResourceController = require('./resourceControllerFactory');
const FormDataService = require('../services/FormDataService');

module.exports = createResourceController(FormDataService, 'Form data', {
  exclude: ['store', 'destroy'],
  buildListParams: (req) => ({ form_id: req.query.form_id }),
});
