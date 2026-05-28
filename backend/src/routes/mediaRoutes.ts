import type { FastifyInstance } from 'fastify';
import * as mediaController from '../controllers/mediaController.js';
import { upload } from '../config/upload.js';
import { requireAuth } from '../middlewares/auth.js';

export async function mediaRoutes(app: FastifyInstance) {
  app.post(
    '/api/journals/:id/media',
    {
      preHandler: [requireAuth, upload.array('files', 20)],
    },
    mediaController.uploadMedia,
  );
  app.delete('/api/journals/:id/media/:mediaId', { preHandler: requireAuth }, mediaController.deleteMedia);
}

