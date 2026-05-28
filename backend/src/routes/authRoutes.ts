import type { FastifyInstance } from 'fastify';
import * as authController from '../controllers/authController.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/auth/login', authController.login);
  app.post('/api/auth/logout', authController.logout);
  app.get('/api/auth/me', authController.me);
}

