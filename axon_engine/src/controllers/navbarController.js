const createResourceController = require('./resourceControllerFactory');
const NavbarService = require('../services/NavbarService');

module.exports = createResourceController(NavbarService, 'Navbar');
