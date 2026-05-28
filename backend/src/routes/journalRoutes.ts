import type { FastifyInstance } from 'fastify';
import * as journalController from '../controllers/journalController.js';
import { requireAuth } from '../middlewares/auth.js';

export async function journalRoutes(app: FastifyInstance) {
  app.get('/api/journals', journalController.listJournals);
  app.get('/api/journals/:id', journalController.getJournal);
  app.post('/api/journals', { preHandler: requireAuth }, journalController.createJournal);
  app.put('/api/journals/:id', { preHandler: requireAuth }, journalController.updateJournal);
  app.delete('/api/journals/:id', { preHandler: requireAuth }, journalController.deleteJournal);
}

