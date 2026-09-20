import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import asyncHandler from '../utils/asyncHandler';
import { sendServiceResult, sendDeleted } from '../utils/controllerHelpers';
import { parsePagination } from '../utils/pagination';
import MediaService from '../services/MediaService';

const uploadDir = process.env.UPLOAD_DIR || 'uploads/media';
const absUploadDir = path.resolve(uploadDir);

if (!fs.existsSync(absUploadDir)) {
  fs.mkdirSync(absUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, absUploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const generatedTitle = `headless_${crypto.randomBytes(3).toString('hex')}`;
    cb(null, `${generatedTitle}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '209715200', 10) },
});

const index = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const result = await MediaService.list(pagination);
  return sendServiceResult(res, result);
});

const show = asyncHandler(async (req, res) => {
  const result = await MediaService.show(req.params.id);
  return sendServiceResult(res, result);
});

const pageview = asyncHandler(async (req, res) => {
  const result = await MediaService.pageview(req.query);
  return sendServiceResult(res, result);
});

const uploadFiles = asyncHandler(async (req, res) => {
  const filesField = req.files as
    | Express.Multer.File[]
    | { file?: Express.Multer.File[]; 'file[]'?: Express.Multer.File[] }
    | undefined;
  const files = Array.isArray(filesField)
    ? filesField
    : [...(filesField?.file || []), ...(filesField?.['file[]'] || [])];
  const result = await MediaService.upload(files, req.body.tags);
  return sendServiceResult(res, result);
});

const update = asyncHandler(async (req, res) => {
  const result = await MediaService.update(req.params.id, req.body);
  return sendServiceResult(res, result);
});

const destroy = asyncHandler(async (req, res) => {
  const resource = await MediaService.remove(req.params.id);
  return sendDeleted(res, resource);
});

export { index, show, pageview, uploadFiles, update, destroy, upload };
export default { index, show, pageview, uploadFiles, update, destroy, upload };
