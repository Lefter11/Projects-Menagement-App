const request = require('supertest');
const app = require('../server');

describe('Health check', () => {
  it('GET / should return API running', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Project Management API/);
  });
});