import { parseCsvToGeoJSON } from '../services/csvToGeojson.js';

export default async function uploadRoutes(fastify) {
  fastify.post('/upload', async (request, reply) => {
    let file;

    try {
      file = await request.file();
    } catch (err) {
      if (err.code === 'FST_REQ_FILE_TOO_LARGE') {
        return reply.code(413).send({ error: 'File size exceeds 10 MB limit' });
      }
      throw err;
    }

    if (!file) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }

    const filename = file.filename || '';
    if (!filename.toLowerCase().endsWith('.csv')) {
      return reply.code(400).send({ error: 'Only CSV files are allowed' });
    }

    try {
      const geojson = await parseCsvToGeoJSON(file.file);
      return reply.send(geojson);
    } catch (err) {
      request.log.warn(err, 'CSV parse error');
      return reply.code(400).send({ error: err.message || 'Failed to parse CSV' });
    }
  });
}
