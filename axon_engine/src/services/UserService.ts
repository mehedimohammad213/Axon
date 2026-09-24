import AppError from '../utils/AppError';
import { isPlatformSuperAdmin } from '../db/queryScope';
import UserModel from '../models/UserModel';
import { hashPassword } from '../utils/helpers';

async function list(currentUser: any, organizationId: any) {
  return UserModel.findAllForUser(currentUser, organizationId);
}

async function create(currentUser: any, body: any) {
  const {
    name,
    email,
    password,
    password_confirmation,
    phone,
    profile_picture_id,
    role_id,
    organization_id,
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

  return UserModel.createUser(
    {
      name,
      email,
      phone: phone || null,
      profile_picture_id: profile_picture_id || null,
      role_id: role_id || null,
      password: await hashPassword(password),
    },
    {
      organizationId: isPlatformSuperAdmin(currentUser) ? organization_id : undefined,
    }
  );
}

async function update(id: any, body: any) {
  const user = await UserModel.findById(id);
  if (!user) throw new AppError(404, 'User not found');

  const updates: Record<string, any> = {};
  const fields = [
    'name',
    'phone',
    'email',
    'profile_picture_id',
    'role_id',
  ];
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

async function remove(id: any) {
  const user = await UserModel.findById(id);
  if (!user) throw new AppError(404, 'User not found');

  await UserModel.remove(id);
  return 'User';
}

export default {
  list,
  create,
  update,
  remove,
};
export { list, create, update, remove };
