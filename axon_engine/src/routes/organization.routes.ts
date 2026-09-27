import express from 'express';
import * as organizationController from '../controllers/organization.controller';
import {
  validateCreateOrganization,
  validateCreateOrganizationRole,
  validateCreateOrganizationUser,
  validateUpdateOrganization,
} from '../validators/organization.validator';

const router = express.Router();

router.get('/organizations/role-templates', organizationController.roleTemplates);
router.get('/organizations', organizationController.index);
router.post('/organizations', validateCreateOrganization, organizationController.store);
router.get('/organizations/:id', organizationController.show);
router.put('/organizations/:id', validateUpdateOrganization, organizationController.update);
router.delete('/organizations/:id', organizationController.destroy);
router.get('/organizations/:id/roles', organizationController.roles);
router.post('/organizations/:id/roles', validateCreateOrganizationRole, organizationController.storeRole);
router.put('/organizations/:id/roles/:roleId', organizationController.updateRole);
router.delete('/organizations/:id/roles/:roleId', organizationController.destroyRole);
router.get('/organizations/:id/users', organizationController.users);
router.post('/organizations/:id/users', validateCreateOrganizationUser, organizationController.storeUser);
router.put('/organizations/:id/users/:userId', organizationController.updateUser);
router.delete('/organizations/:id/users/:userId', organizationController.destroyUser);
router.post('/organizations/:id/regenerate-site-key', organizationController.regenerateSiteKey);

export default router;
