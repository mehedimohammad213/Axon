const createResourceController = require('./resourceControllerFactory');
const FooterService = require('../services/FooterService');

module.exports = createResourceController(FooterService, 'Footer');
