const { db } = require('../db');
const { createModel } = require('./BaseModel');
const { syncRolePermissions } = require('../utils/helpers');

const base = createModel('roles');

async function loadWithPermissions(roleId) {
  const role = await db.findOne('roles', { id: roleId });
  if (!role) return null;

  const perms = await db.queryAll(
    `SELECT permissions.*
     FROM role_permission
     JOIN permissions ON permissions.id = role_permission.permission_id
     WHERE role_permission.role_id = $1`,
    [roleId]
  );

  return { ...role, permission_headless: perms };
}

async function findAllWithPermissions() {
  const roles = await base.findAll();
  return Promise.all(roles.map((r) => loadWithPermissions(r.id)));
}

async function createWithPermissions(data) {
  const role = await base.create(data);
  if (data.permission_ids?.length) {
    await syncRolePermissions(role.id, data.permission_ids);
  }
  return loadWithPermissions(role.id);
}

async function updateWithPermissions(id, data) {
  const role = await base.findById(id);
  if (!role) return null;

  await base.update(id, {
    title: data.title ?? role.title,
    description: data.description ?? role.description,
    status: data.status !== undefined ? data.status : role.status,
  });

  if (data.permission_ids) {
    await syncRolePermissions(id, data.permission_ids);
  }

  return loadWithPermissions(id);
}

module.exports = {
  ...base,
  loadWithPermissions,
  findAllWithPermissions,
  createWithPermissions,
  updateWithPermissions,
};
