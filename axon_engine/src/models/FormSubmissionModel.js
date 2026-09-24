const { db, findWhereIn, queryAll } = require('../db');
const { createModel } = require('./BaseModel');
const { paginatedResponse } = require('../utils/pagination');
const { replaceJunction } = require('../utils/junctions');

const base = createModel('form_submissions');

async function loadMediaList(submission) {
  if (!submission) return submission;

  const rows = await queryAll(
    `SELECT media_id, field_name, sort_order
     FROM form_submission_media
     WHERE form_submission_id = $1
     ORDER BY sort_order ASC, id ASC`,
    [submission.id]
  );

  const result = { ...submission, media_list: null };
  if (!rows.length) return result;

  const mediaRows = await findWhereIn(
    'media',
    'id',
    rows.map((row) => row.media_id)
  );
  const byId = new Map(mediaRows.map((item) => [String(item.id), item]));

  const mediaList = {};
  for (const row of rows) {
    const media = byId.get(String(row.media_id));
    if (!media) continue;
    const key = row.field_name || `media_${row.media_id}`;
    mediaList[key] = {
      file_name: media.file_name,
      file_path: media.file_path,
      media_id: media.id,
    };
  }

  result.media_list = Object.keys(mediaList).length ? mediaList : null;
  return result;
}

async function resolveMediaLinks(mediaList, organizationId) {
  if (!mediaList || typeof mediaList !== 'object' || Array.isArray(mediaList)) {
    return [];
  }

  const links = [];
  let sortOrder = 0;
  for (const [fieldName, value] of Object.entries(mediaList)) {
    if (!value || typeof value !== 'object') continue;

    let media = null;
    if (value.media_id) {
      media = await db.findOne('media', { id: value.media_id });
    } else if (value.file_path) {
      media = await db.findOne('media', {
        file_path: value.file_path,
        ...(organizationId ? { organization_id: organizationId } : {}),
      });
    }

    if (media) {
      links.push({ mediaId: media.id, fieldName, sortOrder });
      sortOrder += 1;
    }
  }

  return links;
}

async function syncMedia(submission, mediaList) {
  if (mediaList === undefined) return;
  const links = await resolveMediaLinks(mediaList, submission.organization_id);
  await replaceJunction(
    'form_submission_media',
    'form_submission_id',
    submission.id,
    'media_id',
    links.map((link) => link.mediaId),
    {
      organizationId: submission.organization_id,
      extras: (mediaId) => {
        const link = links.find((item) => String(item.mediaId) === String(mediaId));
        return { field_name: link?.fieldName || null };
      },
    }
  );
}

async function findAllFilteredPaginated({ form_id, form_type, page = 1, limit = 20 } = {}) {
  let query = base.query().orderBy('id', 'desc');
  if (form_id) query = query.where('form_id', form_id);
  if (form_type) query = query.where('form_type', form_type);

  const offset = (page - 1) * limit;
  const [data, countRow] = await Promise.all([
    query.clone().limit(limit).offset(offset),
    query.clone().count().first(),
  ]);

  return paginatedResponse(
    await Promise.all(data.map(loadMediaList)),
    countRow.count,
    page,
    limit
  );
}

async function createSubmission({ form_id, form_type, form_data, media_list, status }) {
  const submission = await base.create({
    form_id: form_id || null,
    form_type: form_type || null,
    form_data: form_data ? JSON.stringify(form_data) : null,
    status: status || 'new',
  });
  await syncMedia(submission, media_list);
  return loadMediaList(submission);
}

async function updateSubmission(id, { form_id, form_type, form_data, media_list, status }, existing) {
  const updated = await base.update(id, {
    form_id: form_id ?? existing.form_id,
    form_type: form_type ?? existing.form_type,
    form_data: form_data ? JSON.stringify(form_data) : existing.form_data,
    status: status ?? existing.status,
  });
  await syncMedia(updated, media_list);
  return loadMediaList(updated);
}

module.exports = {
  ...base,
  findAllFilteredPaginated,
  createSubmission,
  updateSubmission,
};
