const crypto = require('crypto');
const AppError = require('../utils/AppError');
const ApiKeyModel = require('../models/ApiKeyModel');

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

async function list({ page, limit } = {}) {
  return ApiKeyModel.findAllLivePaginated({ page, limit });
}

async function show(id) {
  const key = await ApiKeyModel.findByIdPublic(id);
  if (!key || key.revoked_at) throw new AppError(404, 'API key not found');
  return key;
}

async function create(body, actor = null) {
  const name = String(body?.name || '').trim();
  if (!name) {
    throw new AppError(422, 'Validation failed', {
      name: ['The name field is required.'],
    });
  }

  const raw = `axon_${crypto.randomBytes(24).toString('hex')}`;
  const row = await ApiKeyModel.create({
    name,
    user_id: actor?.id || null,
    key_prefix: raw.slice(0, 12),
    key_hash: hashToken(raw),
    expires_at: body.expires_at || null,
  });

  return {
    ...ApiKeyModel.publicRow(row),
    key: raw,
  };
}

async function update(id, body) {
  const existing = await ApiKeyModel.findById(id);
  if (!existing || existing.revoked_at) throw new AppError(404, 'API key not found');

  const payload = {};
  if (body.name !== undefined) {
    const name = String(body.name || '').trim();
    if (!name) {
      throw new AppError(422, 'Validation failed', {
        name: ['The name field is required.'],
      });
    }
    payload.name = name;
  }
  if (body.expires_at !== undefined) payload.expires_at = body.expires_at || null;

  return ApiKeyModel.publicRow(await ApiKeyModel.update(id, payload));
}

async function remove(id) {
  const existing = await ApiKeyModel.findById(id);
  if (!existing || existing.revoked_at) throw new AppError(404, 'API key not found');

  await ApiKeyModel.update(id, { revoked_at: new Date() });
  return 'API key';
}

module.exports = { list, show, create, update, remove };
