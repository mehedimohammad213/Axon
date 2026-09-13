const AppError = require('../utils/AppError');
const { isPlatformSuperAdmin } = require('../db/queryScope');
const UserModel = require('../models/UserModel');
const { hashPassword } = require('../utils/helpers');

async function list(currentUser, organizationId) {
  return UserModel.findAllForUser(currentUser, organizationId);
}

async function create(currentUser, body) {
  const {
    name, email, password, password_confirmation,
    phone, profile_picture_id, role_id, organization_id,
  } = body;

  if (!name || !email || !password) {
    throw new AppError(422, 'Validation failed', {
      name: !name ? ['The name field is required.'] : undefined,
      email: !email ? ['The email field is required.'] : undefined,
      password: !password ? ['The password field is required.'] : undefined,
    });
  }

  if (password !== password_confirmation) {
    throw new AppError(422, 'Validation failed', {
      password: ['The password confirmation does not match.'],
    });
  }

  const existing = await UserModel.findByEmail(email);
  if (existing) {
    throw new AppError(422, 'Validation failed', {
      email: ['The email has already been taken.'],
    });
  }

  return UserModel.createUser({
    name,
    email,
    phone: phone || null,
    profile_picture_id: profile_picture_id || null,
    role_id: role_id || null,
    password: await hashPassword(password),
  }, {
    organizationId: isPlatformSuperAdmin(currentUser) ? organization_id : undefined,
  });
}

async function update(id, body) {
  const user = await UserModel.findById(id);
  if (!user) throw new AppError(404, 'User not found');

  const updates = {};
  const fields = ['name', 'phone', 'email', 'profile_picture_id', 'role_id', 'license_key', 'is_license_active'];
  fields.forEach((field) => {
    if (body[field] !== undefined) updates[field] = body[field];
  });

  const full = await UserModel.updateUser(id, updates);

  return {
    message: 'User updated successfully',
    user: full,
    update_result: true,
    fields_sent: Object.keys(body),
  };
}

async function remove(id) {
  const user = await UserModel.findById(id);
  if (!user) throw new AppError(404, 'User not found');

  await UserModel.remove(id);
  return 'User';
}

module.exports = { list, create, update, remove };
