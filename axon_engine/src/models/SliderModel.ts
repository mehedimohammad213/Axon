import { findWhereIn } from '../db';
import { createModel } from './BaseModel';
import CardModel from './CardModel';

const base = createModel('sliders', {
  jsonFields: ['media_ids', 'card_ids', 'additional'],
});

function normalizeIds(value: unknown): (number | string)[] {
  if (value == null || value === '') return [];
  const ids = Array.isArray(value) ? value : [value];
  return ids.filter((id) => id != null && id !== '') as (number | string)[];
}

function orderByIdList(items: Record<string, any>[], ids: (number | string)[]) {
  const map = Object.fromEntries(items.map((item) => [String(item.id), item]));
  return ids.map((id) => map[String(id)]).filter(Boolean);
}

async function loadRelations(slider: Record<string, any> | null | undefined) {
  if (!slider) return slider;
  const result: Record<string, any> = { ...slider };

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
    const withMedia = await Promise.all(cards.map((card: Record<string, any>) => CardModel.loadMedia(card)));
    result.cards = orderByIdList(withMedia, cardIds);
  } else {
    result.cards = [];
  }

  return result;
}

async function findAllWithRelationsPaginated({ page = 1, limit = 20 } = {}) {
  const { data, meta } = await base.findPaginated({ page, limit });
  return {
    data: await Promise.all(data.map((row: Record<string, any>) => loadRelations(row))),
    meta,
  };
}

async function findByIdWithRelations(id: number | string) {
  const slider = await base.findById(id);
  return loadRelations(slider);
}

async function createSlider(data: Record<string, any>) {
  const slider = await base.create(data);
  return loadRelations(slider);
}

async function updateSlider(id: number | string, data: Record<string, any>) {
  const updated = await base.update(id, data);
  return loadRelations(updated);
}

export default {
  ...base,
  loadRelations,
  findAllWithRelationsPaginated,
  findByIdWithRelations,
  createSlider,
  updateSlider,
};
