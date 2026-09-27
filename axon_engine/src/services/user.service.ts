import AppError from '../utils/AppError';
import { isPlatformSuperAdmin } from '../db/queryScope';
import { hashPassword } from '../utils/helpers';
import UserRepository from '../repositories/user.repository';
import { validateCreateUserBody, validateUpdateUserBody } from '../validators/user.validator';
import type { CreateUserInput, UpdateUserInput } from '../models/user.model';

async function list(currentUser: any, organizationId: any) {
  return UserRepository.findAllForUser(currentUser, organizationId);
}

async function create(currentUser: any, body: CreateUserInput) {
  const {
    name,
    email,
    password,
    phone,
    profile_picture_id,
    role_id,
    organization_id,
  } = validateCreateUserBody(body);

  const existing = await UserRepository.findByEmail(email);
  if (existing) {
    throw new AppError(422, 'Validation failed', {
      email: ['The email has already been taken.'],
    });
  }

  return UserRepository.createUser(
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

async function update(id: any, body: UpdateUserInput) {
  const user = await UserRepository.findById(id);
  if (!user) throw new AppError(404, 'User not found');

  const updates = validateUpdateUserBody(body);
  const full = await UserRepository.updateUser(id, updates);

  return {
    message: 'User updated successfully',
    user: full,
    update_result: true,
    fields_sent: Object.keys(body),
  };
}

async function remove(id: any) {
  const user = await UserRepository.findById(id);
  if (!user) throw new AppError(404, 'User not found');

  await UserRepository.remove(id);
  return 'User';
}

export default {
  list,
  create,
  update,
  remove,
};
export { list, create, update, remove };
