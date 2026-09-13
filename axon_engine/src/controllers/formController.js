const createResourceController = require('./resourceControllerFactory');
const FormService = require('../services/FormService');

module.exports = createResourceController(FormService, 'Form', {
  exclude: ['store', 'update', 'destroy'],
});
