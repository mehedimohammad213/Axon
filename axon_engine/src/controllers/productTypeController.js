const createResourceController = require('./resourceControllerFactory');
const ProductTypeService = require('../services/ProductTypeService');

module.exports = createResourceController(ProductTypeService, 'Product type');
