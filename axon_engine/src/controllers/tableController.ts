import createResourceController from './resourceControllerFactory';
import TableService from '../services/TableService';

export default createResourceController(TableService, 'Table');
