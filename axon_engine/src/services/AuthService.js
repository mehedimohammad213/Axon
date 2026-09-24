const { transaction } = require('../db');
const AppError = require('../utils/AppError');
const UserModel = require('../models/UserModel');
const { findOrganizationByHint } = require('../utils/uniqueness');
const {
  uniqueOrganizationSlug,
  seedDefaultRolesForOrganization,
  generateSiteKey,
  hashPassword,
  comparePassword,
  signToken,
  loadUserWithRelations,
} = require('../utils/helpers');

async function register({ name, email, password, password_confirmation, phone, company }) {
  if (!name || !email || !password || !company) {
    throw new AppError(422, 'Validation failed', {
      name: !name ? ['The name field is required.'] : undefined,
      email: !email ? ['The email field is required.'] : undefined,
      password: !password ? ['The password field is required.'] : undefined,
      company: !company ? ['The company field is required.'] : undefined,
    });
  }

  if (password !== password_confirmation) {
    throw new AppError(422, 'Validation failed', {
      password: ['The password confirmation does not match.'],
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

    const createdUser = await trx.findOne('users', { email, organization_id: org.id });
    const userRecord = await loadUserWithRelations(createdUser.id);

    return { user: userRecord, organization: org };
  });

  return { user, organization, token: signToken(user) };
}

async function login(body) {
  const {
    email,
    password,
    organization,
    organization_id,
    organization_slug,
    slug,
    site_key,
  } = body;
  if (!email || !password) {
    throw new AppError(422, 'Validation failed', {
      email: !email ? ['The email field is required.'] : undefined,
      password: !password ? ['The password field is required.'] : undefined,
    });
  }

  const orgHint = organization || organization_id || organization_slug || slug || site_key;
  const hintedOrg = orgHint ? await findOrganizationByHint(orgHint) : null;
  if (orgHint && !hintedOrg) {
    throw new AppError(401, 'Invalid Credentials');
  }

  const matches = await UserModel.findAllByEmail(email);
  const tenantUsers = matches.filter((row) => row.organization_id);
  const platformUsers = matches.filter((row) => !row.organization_id && row.is_super_admin);

  let user = null;
  if (hintedOrg) {
    user = tenantUsers.find((row) => Number(row.organization_id) === Number(hintedOrg.id))
      || platformUsers[0]
      || null;
  } else if (tenantUsers.length > 1) {
    throw new AppError(
      422,
      'This email belongs to more than one organization. Provide organization slug or site_key.'
    );
  } else {
    user = tenantUsers[0] || platformUsers[0] || matches[0] || null;
  }

  if (!user || !(await comparePassword(password, user.password))) {
    throw new AppError(401, 'Invalid Credentials');
  }

  if (!user.organization_id && !user.is_super_admin) {
    throw new AppError(403, 'User is not assigned to an organization');
  }

  const fullUser = await UserModel.findByIdWithRelations(user.id);
  const organizationRecord = fullUser.organization || (user.is_super_admin ? hintedOrg : null);

  return {
    user: fullUser,
    organization: organizationRecord,
    token: signToken(user),
  };
}

async function forgetPassword({ email }) {
  if (!email) {
    throw new AppError(422, 'Validation failed', {
      email: ['The email field is required.'],
    });
  }

  return { status: true, message: 'If the email exists, a reset link has been sent.' };
}

async function resetPassword({ token, email, password, password_confirmation }) {
  if (!token || !email || !password) {
    throw new AppError(422, 'token, email, and password are required.');
  }

  if (password !== password_confirmation) {
    throw new AppError(422, 'Validation failed', {
      password: ['The password confirmation does not match.'],
    });
  }

  return { message: 'Password has been reset.' };
}

async function changePassword(userId, { old_password, new_password, new_password_confirmation }) {
  if (!old_password || !new_password) {
    throw new AppError(422, 'old_password and new_password are required.');
  }

  if (new_password !== new_password_confirmation) {
    throw new AppError(422, 'Validation failed', {
      new_password: ['The password confirmation does not match.'],
    });
  }

  const user = await UserModel.findById(userId);
  if (!(await comparePassword(old_password, user.password))) {
    throw new AppError(422, 'Validation failed', {
      old_password: ['The old password is incorrect.'],
    });
  }

  await UserModel.changePassword(userId, await hashPassword(new_password));

  return { message: 'Password changed successfully.' };
}

module.exports = {
  register,
  login,
  forgetPassword,
  resetPassword,
  changePassword,
};
