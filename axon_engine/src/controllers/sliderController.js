const createResourceController = require('./resourceControllerFactory');
const SliderService = require('../services/SliderService');

module.exports = createResourceController(SliderService, 'Slider', {
  pagination: { defaultLimit: 100, maxLimit: 500 },
});
