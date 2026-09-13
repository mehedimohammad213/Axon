const AppError = require('../utils/AppError');
const MediaModel = require('../models/MediaModel');

async function list({ page, limit } = {}) {
  return MediaModel.findPaginated({ page, limit });
}

async function show(id) {
  const media = await MediaModel.findById(id);
  if (!media) throw new AppError(404, 'Media not found');
  return media;
}

async function pageview({ count, order_type, keyword, page }) {
  return MediaModel.findPageview({
    count: parseInt(count || '15', 10),
    orderType: order_type || 'DESC',
    keyword,
    page: parseInt(page || '1', 10),
  });
}

async function upload(files, tags) {
  if (!files?.length) {
    throw new AppError(422, 'Validation failed', {
      file: ['At least one file is required.'],
    });
  }

  const parsedTags = tags ? (Array.isArray(tags) ? tags : [tags]) : null;
  const uploadedMedia = await MediaModel.createFromFiles(files, parsedTags);

  return { message: 'Files uploaded successfully', media: uploadedMedia };
}

async function update(id, body) {
  const media = await MediaModel.findById(id);
  if (!media) throw new AppError(404, 'Media not found');

  return MediaModel.updateMedia(id, body, media);
}

async function remove(id) {
  const media = await MediaModel.removeWithFile(id);
  if (!media) throw new AppError(404, 'Media not found');
  return 'Media';
}

module.exports = { list, show, pageview, upload, update, remove };
