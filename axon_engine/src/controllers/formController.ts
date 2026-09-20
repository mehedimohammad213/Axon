import createResourceController from './resourceControllerFactory';
import FormService from '../services/FormService';

export default createResourceController(FormService, 'Form', {
  exclude: ['store', 'update', 'destroy'],
});
