const fs = require('fs');
const path = require('path');
const { insert } = require('../db');
const { createModel } = require('./BaseModel');
const { withOrganizationId } = require('../db/queryScope');

const base = createModel('media');

function parseTags(tags) {
  if (tags == null || tags === '') return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      return tags.trim() ? [tags.trim()] : [];
    }
  }
  return [];
}

function normalizeMedia(media) {
  if (!media) return media;
  return { ...media, tags: parseTags(media.tags) };
}

async function findPageview({ count = 15, orderType = 'desc', keyword, page = 1 }) {
  const direction = orderType.toUpperCase() === 'ASC' ? 'asc' : 'desc';
  let query = base.query().orderBy('id', direction);

  if (keyword) {
    query = query.where(function () {
      this.where('file_name', 'ilike', `%${keyword}%`)
        .orWhere('title', 'ilike', `%${keyword}%`);
    });
  }

  const offset = (page - 1) * count;

  const [data, totalResult] = await Promise.all([
    query.clone().limit(count).offset(offset),
    query.clone().count().first(),
  ]);

  const total = totalResult.count;

  return {
    data: data.map(normalizeMedia),
    meta: {
      total,
      page,
      limit: count,
      totalPages: total > 0 ? Math.ceil(total / count) : 0,
    },
  };
}

async function createFromFiles(files, tags) {
  const uploadedMedia = [];
  const tagList = parseTags(tags);

  for (const file of files) {
    const originalName = file.originalname;
    const title = path.parse(originalName).name;
    const generatedTitle = path.parse(file.filename).name;

    const media = await insert('media', withOrganizationId({
      title,
      file_name: generatedTitle,
      file_type: file.mimetype,
      file_path: `${process.env.UPLOAD_DIR || 'uploads/media'}/${file.filename}`,
      file_size: file.size,
      tags: tagList.length ? JSON.stringify(tagList) : null,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    uploadedMedia.push(normalizeMedia(media));
  }

  return uploadedMedia;
}

async function updateMedia(id, { title, file_name, tags }, existing) {
  const payload = {
    title: title ?? existing.title,
    file_name: file_name ?? existing.file_name,
  };

  if (tags !== undefined) {
    const tagList = parseTags(tags);
    payload.tags = tagList.length ? JSON.stringify(tagList) : null;
  }

  return normalizeMedia(await base.update(id, payload));
}

async function removeWithFile(id) {
  const media = await base.findById(id);
  if (!media) return null;

  if (media.file_path && fs.existsSync(path.resolve(media.file_path))) {
    fs.unlinkSync(path.resolve(media.file_path));
  }

  await base.remove(id);
  return media;
}

module.exports = {
  ...base,
  findPageview,
  createFromFiles,
  updateMedia,
  removeWithFile,
  parseTags,
  normalizeMedia,
  async findPaginated(options) {
    const result = await base.findPaginated(options);
    return { ...result, data: result.data.map(normalizeMedia) };
  },
  async findById(id) {
    return normalizeMedia(await base.findById(id));
  },
};
