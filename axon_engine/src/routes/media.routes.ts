import express from 'express';
import * as mediaController from '../controllers/media.controller';
import { validateUpdateMedia } from '../validators/media.validator';

const router = express.Router();

router.get('/media', mediaController.index);
router.get('/media/pageview', mediaController.pageview);
router.get('/media/:id', mediaController.show);
router.post(
  '/media/upload',
  mediaController.upload.fields([
    { name: 'file', maxCount: 20 },
    { name: 'file[]', maxCount: 20 },
  ]),
  mediaController.uploadFiles
);
router.put('/media/:id', validateUpdateMedia, mediaController.update);
router.delete('/media/:id', mediaController.destroy);

export default router;
