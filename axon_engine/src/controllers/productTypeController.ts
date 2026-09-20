import createResourceController from './resourceControllerFactory';
import ProductTypeService from '../services/ProductTypeService';

export default createResourceController(ProductTypeService, 'Product type');
