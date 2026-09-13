const createResourceController = require('./resourceControllerFactory');
const TableService = require('../services/TableService');

module.exports = createResourceController(TableService, 'Table');
