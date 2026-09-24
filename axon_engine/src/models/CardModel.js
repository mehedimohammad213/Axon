const { findWhereIn } = require('../db');
const { createModel } = require('./BaseModel');
const { normalizeIds, listChildIds, replaceJunction, orderByIdList } = require('../utils/junctions');
const { exposeActive } = require('../utils/activeField');

const base = createModel('cards', { active: true });

async function loadMedia(card) {
  if (!card) return card;
  const result = exposeActive({ ...card });

  const ids = await listChildIds('card_media', 'card_id', card.id, 'media_id');
  // CMS historically treats cards.media_ids as a single id.
  result.media_ids = ids[0] || null;

  if (ids.length) {
    const mediaList = await findWhereIn('media', 'id', ids);
    const ordered = orderByIdList(mediaList, ids);
    result.media_files = ordered[0] || null;
    result.media = ordered;
  } else {
    result.media_files = null;
    result.media = [];
  }

  return result;
}

function preparePayload(data) {
  const payload = { ...data };
  if (payload.additional) payload.additional = JSON.stringify(payload.additional);
  delete payload.media_ids;
  delete payload.media;
  delete payload.media_files;
  return payload;
}

async function syncMedia(card, data) {
  if (data.media_ids === undefined) return;
  await replaceJunction(
    'card_media',
    'card_id',
    card.id,
    'media_id',
    normalizeIds(data.media_ids),
    { organizationId: card.organization_id }
  );
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
  await syncMedia(card, data);
  return loadMedia(card);
}

async function updateCard(id, data) {
  const updated = await base.update(id, preparePayload(data));
  await syncMedia(updated, data);
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
