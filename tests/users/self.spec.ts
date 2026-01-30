import app from '@/app';
import { Roles } from '@/constants';
import { prisma } from '@/lib/prisma';
import createJWKSMock from 'mock-jwks';
import request from 'supertest';

describe.skip('GET /auth/self', () => {
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:5501');
    await prisma.$connect();
  });

  beforeEach(async () => {
    jwks?.start();
    await prisma.user.deleteMany();
  });

  afterEach(() => {
    jwks?.stop();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Given all fields', () => {
    it('should return the 200 status code', async () => {
      const accessToken = jwks.token({
        sub: '1',
        role: Roles.CUSTOMER,
      });
      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send();
      expect(response.statusCode).toBe(200);
    });
  });
});
