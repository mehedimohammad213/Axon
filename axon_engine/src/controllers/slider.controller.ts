import createResourceController from './resourceControllerFactory';
import SliderService from '../services/slider.service';

export default createResourceController(SliderService, 'Slider', {
  pagination: { defaultLimit: 100, maxLimit: 500 },
});
