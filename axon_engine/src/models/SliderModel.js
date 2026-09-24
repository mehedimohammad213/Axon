const { findWhereIn } = require('../db');
const { createModel } = require('./BaseModel');
const CardModel = require('./CardModel');
const { listChildIds, replaceJunction, orderByIdList } = require('../utils/junctions');
const { exposeActive } = require('../utils/activeField');

const base = createModel('sliders', {
  jsonFields: ['additional'],
  active: 'numeric',
});

async function loadRelations(slider) {
  if (!slider) return slider;
  const result = exposeActive({ ...slider }, { numeric: true });

  const mediaIds = await listChildIds('slider_media', 'slider_id', slider.id, 'media_id');
  result.media_ids = mediaIds;
  if (mediaIds.length) {
    const medias = await findWhereIn('media', 'id', mediaIds);
    result.medias = orderByIdList(medias, mediaIds);
  } else {
    result.medias = [];
  }

  const cardIds = await listChildIds('slider_cards', 'slider_id', slider.id, 'card_id');
  result.card_ids = cardIds;
  if (cardIds.length) {
    const cards = await findWhereIn('cards', 'id', cardIds);
    const withMedia = await Promise.all(cards.map((card) => CardModel.loadMedia(card)));
    result.cards = orderByIdList(withMedia, cardIds);
  } else {
    result.cards = [];
  }

  return result;
}

function preparePayload(data) {
  const payload = { ...data };
  delete payload.media_ids;
  delete payload.card_ids;
  delete payload.medias;
  delete payload.cards;
  return payload;
}

async function syncRelations(slider, data) {
  if (data.media_ids !== undefined) {
    await replaceJunction(
      'slider_media',
      'slider_id',
      slider.id,
      'media_id',
      data.media_ids,
      { organizationId: slider.organization_id }
    );
  }

  if (data.card_ids !== undefined) {
    await replaceJunction(
      'slider_cards',
      'slider_id',
      slider.id,
      'card_id',
      data.card_ids,
      { organizationId: slider.organization_id }
    );
  }
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
  const slider = await base.create(preparePayload(data));
  await syncRelations(slider, data);
  return loadRelations(slider);
}

async function updateSlider(id, data) {
  const updated = await base.update(id, preparePayload(data));
  await syncRelations(updated, data);
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
