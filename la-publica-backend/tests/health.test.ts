import request from 'supertest';
import { app } from '../src/server';

describe('Health Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('GET /api/info', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/api/info')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'La Pública API');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('features');
      expect(Array.isArray(response.body.features)).toBe(true);
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Endpoint no encontrado');
    });
  });
});
