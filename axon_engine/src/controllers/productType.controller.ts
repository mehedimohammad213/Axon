import createResourceController from './resourceControllerFactory';
import ProductTypeService from '../services/productType.service';

export default createResourceController(ProductTypeService, 'Product type');
