import createResourceController from './resourceControllerFactory';
import ProductService from '../services/ProductService';

export default createResourceController(ProductService, 'Product', {
  buildListParams: (req) => ({
    product_type_id: req.query.product_type_id || undefined,
  }),
});
