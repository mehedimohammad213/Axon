const { findWhereIn } = require('../db');
const { createModel } = require('./BaseModel');
const CardModel = require('./CardModel');

const base = createModel('sliders', {
  jsonFields: ['media_ids', 'card_ids', 'additional'],
});

function normalizeIds(value) {
  if (value == null || value === '') return [];
  const ids = Array.isArray(value) ? value : [value];
  return ids.filter((id) => id != null && id !== '');
}

function orderByIdList(items, ids) {
  const map = Object.fromEntries(items.map((item) => [String(item.id), item]));
  return ids.map((id) => map[String(id)]).filter(Boolean);
}

async function loadRelations(slider) {
  if (!slider) return slider;
  const result = { ...slider };

  const mediaIds = normalizeIds(slider.media_ids);
  if (mediaIds.length) {
    const medias = await findWhereIn('media', 'id', mediaIds);
    result.medias = orderByIdList(medias, mediaIds);
  } else {
    result.medias = [];
  }

  const cardIds = normalizeIds(slider.card_ids);
  if (cardIds.length) {
    const cards = await findWhereIn('cards', 'id', cardIds);
    const withMedia = await Promise.all(cards.map((card) => CardModel.loadMedia(card)));
    result.cards = orderByIdList(withMedia, cardIds);
  } else {
    result.cards = [];
  }

  return result;
}

async function findAllWithRelationsPaginated({ page = 1, limit = 20 } = {}) {
  const { data, meta } = await base.findPaginated({ page, limit });
  return {
    data: await Promise.all(data.map(loadRelations)),
    meta,
  };
}

async function findByIdWithRelations(id) {
  const slider = await base.findById(id);
  return loadRelations(slider);
}

async function createSlider(data) {
  const slider = await base.create(data);
  return loadRelations(slider);
}

async function updateSlider(id, data) {
  const updated = await base.update(id, data);
  return loadRelations(updated);
}

module.exports = {
  ...base,
  loadRelations,
  findAllWithRelationsPaginated,
  findByIdWithRelations,
  createSlider,
  updateSlider,
};
