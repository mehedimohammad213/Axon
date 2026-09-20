import createResourceController from './resourceControllerFactory';
import CardService from '../services/CardService';

export default createResourceController(CardService, 'Card');
