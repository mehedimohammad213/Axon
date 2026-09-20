import createResourceController from './resourceControllerFactory';
import FormDataService from '../services/FormDataService';

export default createResourceController(FormDataService, 'Form data', {
  exclude: ['store', 'destroy'],
  buildListParams: (req) => ({ form_id: req.query.form_id }),
});
