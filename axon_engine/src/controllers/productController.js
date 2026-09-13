const createResourceController = require('./resourceControllerFactory');
const ProductService = require('../services/ProductService');

module.exports = createResourceController(ProductService, 'Product', {
  buildListParams: (req) => ({
    product_type_id: req.query.product_type_id || undefined,
  }),
});
