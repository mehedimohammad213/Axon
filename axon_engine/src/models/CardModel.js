const { findWhereIn } = require('../db');
const { createModel } = require('./BaseModel');

const base = createModel('cards');

async function loadMedia(card) {
  if (!card) return card;
  const result = { ...card };

  if (card.media_ids != null && card.media_ids !== '') {
    const ids = Array.isArray(card.media_ids)
      ? card.media_ids
      : [card.media_ids];
    const mediaList = await findWhereIn(
      'media',
      'id',
      ids.filter((id) => id != null && id !== '')
    );
    // Match Laravel hasOne: media_files is a single object (or null)
    result.media_files = mediaList[0] || null;
    result.media = mediaList;
  }

  return result;
}

function preparePayload(data) {
  const payload = { ...data };
  if (payload.additional) payload.additional = JSON.stringify(payload.additional);
  if (Array.isArray(payload.media_ids)) {
    payload.media_ids = payload.media_ids[0] || null;
  }
  return payload;
}

async function findAllWithMediaPaginated({ page = 1, limit = 20 } = {}) {
  const { data, meta } = await base.findPaginated({ page, limit });
  return {
    data: await Promise.all(data.map(loadMedia)),
    meta,
  };
}

async function findByIdWithMedia(id) {
  const card = await base.findById(id);
  return loadMedia(card);
}

async function createCard(data) {
  const card = await base.create(preparePayload(data));
  return loadMedia(card);
}

async function updateCard(id, data) {
  const updated = await base.update(id, preparePayload(data));
  return loadMedia(updated);
}

module.exports = {
  ...base,
  loadMedia,
  findAllWithMediaPaginated,
  findByIdWithMedia,
  createCard,
  updateCard,
};
