import asyncHandler from '../utils/asyncHandler';
import { sendServiceResult, sendDeleted } from '../utils/controllerHelpers';
import OrganizationService from '../services/OrganizationService';

const index = asyncHandler(async (req, res) => {
  return sendServiceResult(res, await OrganizationService.list(req.user));
});

const show = asyncHandler(async (req, res) => {
  return sendServiceResult(res, await OrganizationService.getById(req.user, req.params.id));
});

const store = asyncHandler(async (req, res) => {
  const result = await OrganizationService.create(req.user, req.body);
  return sendServiceResult(res, result, 201);
});

const update = asyncHandler(async (req, res) => {
  return sendServiceResult(res, await OrganizationService.update(req.user, req.params.id, req.body));
});

const destroy = asyncHandler(async (req, res) => {
  const resource = await OrganizationService.remove(req.user, req.params.id);
  return sendDeleted(res, resource);
});

const roleTemplates = asyncHandler(async (req, res) => {
  return sendServiceResult(res, OrganizationService.roleTemplates(req.user));
});

const regenerateSiteKey = asyncHandler(async (req, res) => {
  return sendServiceResult(res, await OrganizationService.regenerateSiteKey(req.user, req.params.id));
});

const roles = asyncHandler(async (req, res) => {
  return sendServiceResult(res, await OrganizationService.listRoles(req.user, req.params.id));
});

const storeRole = asyncHandler(async (req, res) => {
  const role = await OrganizationService.createRole(req.user, req.params.id, req.body);
  return sendServiceResult(res, role, 201);
});

const updateRole = asyncHandler(async (req, res) => {
  return sendServiceResult(
    res,
    await OrganizationService.updateRole(req.user, req.params.id, req.params.roleId, req.body)
  );
});

const destroyRole = asyncHandler(async (req, res) => {
  const resource = await OrganizationService.deleteRole(req.user, req.params.id, req.params.roleId);
  return sendDeleted(res, resource);
});

const users = asyncHandler(async (req, res) => {
  return sendServiceResult(res, await OrganizationService.listUsers(req.user, req.params.id));
});

const storeUser = asyncHandler(async (req, res) => {
  const user = await OrganizationService.createUser(req.user, req.params.id, req.body);
  return sendServiceResult(res, user, 201);
});

const updateUser = asyncHandler(async (req, res) => {
  return sendServiceResult(
    res,
    await OrganizationService.updateUser(req.user, req.params.id, req.params.userId, req.body)
  );
});

const destroyUser = asyncHandler(async (req, res) => {
  const resource = await OrganizationService.deleteUser(req.user, req.params.id, req.params.userId);
  return sendDeleted(res, resource);
});

export {
  index,
  show,
  store,
  update,
  destroy,
  roleTemplates,
  regenerateSiteKey,
  roles,
  storeRole,
  updateRole,
  destroyRole,
  users,
  storeUser,
  updateUser,
  destroyUser,
};
