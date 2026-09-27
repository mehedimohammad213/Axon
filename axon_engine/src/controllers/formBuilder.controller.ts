import createResourceController from './resourceControllerFactory';
import FormBuilderService from '../services/formBuilder.service';

export default createResourceController(FormBuilderService, 'form_builder');
