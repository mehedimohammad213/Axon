import AppError from '../utils/AppError';
import MediaRepository from '../repositories/media.repository';
import { validateUploadFiles, validateUpdateMediaBody } from '../validators/media.validator';
import type { MediaPageviewQuery, UpdateMediaInput } from '../models/media.model';

async function list({ page, limit }: { page?: number; limit?: number } = {}) {
  return MediaRepository.findPaginated({ page, limit });
}

async function show(id: any) {
  const media = await MediaRepository.findById(id);
  if (!media) throw new AppError(404, 'Media not found');
  return media;
}

async function pageview({
  count,
  order_type,
  keyword,
  page,
}: MediaPageviewQuery) {
  return MediaRepository.findPageview({
    count: parseInt(count || '15', 10),
    orderType: order_type || 'DESC',
    keyword,
    page: parseInt(page || '1', 10),
  });
}

async function upload(files: any[], tags: any) {
  const parsedTags = tags ? (Array.isArray(tags) ? tags : [tags]) : null;
  const uploadedMedia = await MediaRepository.createFromFiles(validateUploadFiles(files), parsedTags);

  return { message: 'Files uploaded successfully', media: uploadedMedia };
}

async function update(id: any, body: UpdateMediaInput) {
  const media = await MediaRepository.findById(id);
  if (!media) throw new AppError(404, 'Media not found');

  return MediaRepository.updateMedia(id, validateUpdateMediaBody(body), media);
}

async function remove(id: any) {
  const media = await MediaRepository.removeWithFile(id);
  if (!media) throw new AppError(404, 'Media not found');
  return 'Media';
}

export default {
  list,
  show,
  pageview,
  upload,
  update,
  remove,
};
export { list, show, pageview, upload, update, remove };
