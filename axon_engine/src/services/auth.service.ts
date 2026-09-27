import { transaction } from '../db';
import AppError from '../utils/AppError';
import UserRepository from '../repositories/user.repository';
import {
  uniqueOrganizationSlug,
  seedDefaultRolesForOrganization,
  generateSiteKey,
  hashPassword,
  comparePassword,
  signToken,
  loadUserWithRelations,
} from '../utils/helpers';
import {
  validateChangePasswordBody,
  validateForgetPasswordBody,
  validateLoginBody,
  validateRegisterBody,
  validateResetPasswordBody,
} from '../validators/auth.validator';
import type {
  ChangePasswordInput,
  ForgetPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '../models/auth.model';

async function register(body: RegisterInput) {
  const { name, email, password, phone, company } = validateRegisterBody(body);

  const existing = await UserRepository.findByEmail(email);
  if (existing) {
    throw new AppError(422, 'Validation failed', {
      email: ['The email has already been taken.'],
    });
  }

  const { user, organization } = await transaction(async (trx) => {
    const slug = await uniqueOrganizationSlug(company, trx);
    const org = await trx.insert('organizations', {
      name: company,
      slug,
      email,
      phone: phone || null,
      is_active: true,
      site_key: generateSiteKey(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    const roles = await seedDefaultRolesForOrganization(org.id, trx);
    const adminRole = roles.Admin;

    await trx.insert('users', {
      name,
      email,
      phone: phone || null,
      password: await hashPassword(password),
      organization_id: org.id,
      role_id: adminRole.id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const createdUser = await trx.findOne('users', { email });
    const userRecord = await loadUserWithRelations(createdUser.id);

    return { user: userRecord, organization: org };
  });

  return { user, organization, token: signToken(user) };
}

async function login(body: LoginInput) {
  const { email, password } = validateLoginBody(body);
  const user = await UserRepository.findByEmail(email);

  if (!user || !(await comparePassword(password, user.password))) {
    throw new AppError(401, 'Invalid Credentials');
  }

  if (!user.organization_id) {
    throw new AppError(403, 'User is not assigned to an organization');
  }

  const fullUser = await UserRepository.findByIdWithRelations(user.id);

  return {
    user: fullUser,
    organization: fullUser.organization,
    token: signToken(user),
  };
}

async function forgetPassword(body: ForgetPasswordInput) {
  validateForgetPasswordBody(body);
  return { status: true, message: 'If the email exists, a reset link has been sent.' };
}

async function resetPassword(body: ResetPasswordInput) {
  validateResetPasswordBody(body);
  return { message: 'Password has been reset.' };
}

async function changePassword(userId: any, body: ChangePasswordInput) {
  const { old_password, new_password } = validateChangePasswordBody(body);
  const user = await UserRepository.findById(userId);
  if (!(await comparePassword(old_password, user.password))) {
    throw new AppError(422, 'Validation failed', {
      old_password: ['The old password is incorrect.'],
    });
  }

  await UserRepository.changePassword(userId, await hashPassword(new_password));
  return { message: 'Password changed successfully.' };
}

export default {
  register,
  login,
  forgetPassword,
  resetPassword,
  changePassword,
};
export { register, login, forgetPassword, resetPassword, changePassword };
