import createResourceController from './resourceControllerFactory';
import CardService from '../services/card.service';

export default createResourceController(CardService, 'Card');
