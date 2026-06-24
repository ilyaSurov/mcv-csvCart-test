import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import healthRoutes from './routes/health.js';
import uploadRoutes from './routes/upload.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: true,
  });

  await app.register(multipart, {
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
  });

  await app.register(healthRoutes);
  await app.register(uploadRoutes);

  return app;
}