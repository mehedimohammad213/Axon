import { findWhereIn } from '../db';
import { createModel } from '../models/BaseModel';
import { CARD_TABLE } from '../models/card.model';

const base = createModel(CARD_TABLE);

async function loadMedia(card: Record<string, any> | null | undefined) {
  if (!card) return card;
  const result: Record<string, any> = { ...card };

  if (card.media_ids != null && card.media_ids !== '') {
    const ids = Array.isArray(card.media_ids)
      ? card.media_ids
      : [card.media_ids];
    const mediaList = await findWhereIn(
      'media',
      'id',
      ids.filter((id) => id != null && id !== '')
    );
    result.media_files = mediaList[0] || null;
    result.media = mediaList;
  }

  return result;
}

function preparePayload(data: Record<string, any>) {
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
    data: await Promise.all(data.map((row: Record<string, any>) => loadMedia(row))),
    meta,
  };
}

async function findByIdWithMedia(id: number | string) {
  const card = await base.findById(id);
  return loadMedia(card);
}

async function createCard(data: Record<string, any>) {
  const card = await base.create(preparePayload(data));
  return loadMedia(card);
}

async function updateCard(id: number | string, data: Record<string, any>) {
  const updated = await base.update(id, preparePayload(data));
  return loadMedia(updated);
}

export default {
  ...base,
  loadMedia,
  findAllWithMediaPaginated,
  findByIdWithMedia,
  createCard,
  updateCard,
};
