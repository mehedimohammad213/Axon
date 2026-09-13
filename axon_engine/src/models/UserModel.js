const { db } = require('../db');
const { createModel } = require('./BaseModel');
const { scopedQuery, withOrganizationId } = require('../db/queryScope');
const { hashPassword, loadUserWithRelations } = require('../utils/helpers');

const base = createModel('users');

async function findAllForUser(currentUser, organizationId) {
  let users;

  if (currentUser?.is_super_admin && organizationId) {
    users = await db.findAll('users', { organization_id: organizationId }, { orderBy: 'id', orderDirection: 'desc' });
  } else {
    users = await scopedQuery('users')
      .select(
        'id', 'organization_id', 'name', 'email', 'phone', 'profile_picture_id',
        'role_id', 'is_super_admin', 'created_at', 'updated_at'
      )
      .orderBy('id', 'desc');
  }

  return Promise.all(users.map((u) => loadUserWithRelations(u.id)));
}

async function findByEmail(email) {
  return db.findOne('users', { email });
}

async function findByIdWithRelations(id) {
  return loadUserWithRelations(id);
}

async function createUser(data, options = {}) {
  const payload = withOrganizationId({
    ...data,
    created_at: new Date(),
    updated_at: new Date(),
  });

  if (options.organizationId) {
    payload.organization_id = options.organizationId;
  }

  const user = await db.insert('users', payload);
  return loadUserWithRelations(user.id);
}

async function updateUser(id, updates) {
  await db.update('users', { id }, { ...updates, updated_at: new Date() });
  return loadUserWithRelations(id);
}

async function changePassword(id, hashedPassword) {
  return db.update('users', { id }, {
    password: hashedPassword,
    updated_at: new Date(),
  });
}

module.exports = {
  ...base,
  findAllForUser,
  findByEmail,
  findByIdWithRelations,
  createUser,
  updateUser,
  changePassword,
  hashPassword,
};
