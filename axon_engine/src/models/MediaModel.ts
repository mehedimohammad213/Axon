import fs from 'fs';
import path from 'path';
import { insert } from '../db';
import { createModel } from './BaseModel';
import { withOrganizationId } from '../db/queryScope';

const base = createModel('media');

function parseTags(tags: unknown): string[] {
  if (tags == null || tags === '') return [];
  if (Array.isArray(tags)) return tags as string[];
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

function normalizeMedia(media: Record<string, any> | null | undefined) {
  if (!media) return media;
  return { ...media, tags: parseTags(media.tags) };
}

async function findPageview({
  count = 15,
  orderType = 'desc',
  keyword,
  page = 1,
}: { count?: number; orderType?: string; keyword?: string; page?: number } = {}) {
  const direction = orderType.toUpperCase() === 'ASC' ? 'asc' : 'desc';
  let query = base.query().orderBy('id', direction);

  if (keyword) {
    query = query.where(function (this: any) {
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
    data: data.map((row: Record<string, any>) => normalizeMedia(row)),
    meta: {
      total,
      page,
      limit: count,
      totalPages: total > 0 ? Math.ceil(total / count) : 0,
    },
  };
}

async function createFromFiles(files: Record<string, any>[], tags: unknown) {
  const uploadedMedia: Record<string, any>[] = [];
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

    uploadedMedia.push(normalizeMedia(media)!);
  }

  return uploadedMedia;
}

async function updateMedia(
  id: number | string,
  { title, file_name, tags }: Record<string, any>,
  existing: Record<string, any>
) {
  const payload: Record<string, any> = {
    title: title ?? existing.title,
    file_name: file_name ?? existing.file_name,
  };

  if (tags !== undefined) {
    const tagList = parseTags(tags);
    payload.tags = tagList.length ? JSON.stringify(tagList) : null;
  }

  return normalizeMedia(await base.update(id, payload));
}

async function removeWithFile(id: number | string) {
  const media = await base.findById(id);
  if (!media) return null;

  await base.remove(id);
  return media;
}

function deleteStoredFile(filePath: string | null | undefined) {
  if (!filePath) return;
  const resolved = path.resolve(filePath);
  if (fs.existsSync(resolved)) {
    fs.unlinkSync(resolved);
  }
}

async function forceDeleteWithFile(id: number | string) {
  const media = await base.findById(id, { withTrashed: true });
  if (!media) return null;

  deleteStoredFile(media.file_path);
  await base.forceDelete(id);
  return media;
}

export default {
  ...base,
  findPageview,
  createFromFiles,
  updateMedia,
  removeWithFile,
  forceDeleteWithFile,
  deleteStoredFile,
  parseTags,
  normalizeMedia,
  async findPaginated(options?: Parameters<typeof base.findPaginated>[0]) {
    const result = await base.findPaginated(options);
    return { ...result, data: result.data.map((row: Record<string, any>) => normalizeMedia(row)) };
  },
  async findById(id: number | string) {
    return normalizeMedia(await base.findById(id));
  },
};
