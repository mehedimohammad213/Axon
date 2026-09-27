import createResourceController from './resourceControllerFactory';
import ProductService from '../services/product.service';

export default createResourceController(ProductService, 'Product', {
  buildListParams: (req) => ({
    product_type_id: req.query.product_type_id || undefined,
  }),
});
