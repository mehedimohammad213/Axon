const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const asyncHandler = require('../utils/asyncHandler');
const { sendServiceResult, sendDeleted } = require('../utils/controllerHelpers');
const { parsePagination } = require('../utils/pagination');
const MediaService = require('../services/MediaService');

const uploadDir = process.env.UPLOAD_DIR || 'uploads/media';
const absUploadDir = path.resolve(uploadDir);

if (!fs.existsSync(absUploadDir)) {
  fs.mkdirSync(absUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, absUploadDir),
  filename: (req, file, cb) => {
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
  // Accept both `file` (multer/Express) and `file[]` (Laravel-style clients)
  const files = Array.isArray(req.files)
    ? req.files
    : [...(req.files?.file || []), ...(req.files?.['file[]'] || [])];
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

module.exports = { index, show, pageview, uploadFiles, update, destroy, upload };
