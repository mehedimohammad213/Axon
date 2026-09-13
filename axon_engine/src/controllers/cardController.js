const createResourceController = require('./resourceControllerFactory');
const CardService = require('../services/CardService');

module.exports = createResourceController(CardService, 'Card');
