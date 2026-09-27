import createResourceController from './resourceControllerFactory';
import TableService from '../services/table.service';

export default createResourceController(TableService, 'Table');
