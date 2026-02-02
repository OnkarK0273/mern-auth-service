import app from '@/app';
import { Roles } from '@/constants';
import { prisma } from '@/lib/prisma';
import createJWKSMock from 'mock-jwks';
import request from 'supertest';

describe('POST /tenants', () => {
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

  let adminToken: string;

  describe('Given all fields', () => {
    it('should persist the user in the database', async () => {
      // Create tenant first

      const tenant = await prisma.tenant.create({
        data: {
          name: 'Test tenant',
          address: 'Test address',
        },
      });

      const adminToken = jwks.token({
        sub: '1',
        role: Roles.ADMIN,
      });

      // Register user
      const userData = {
        firstName: 'Rakesh',
        lastName: 'K',
        email: 'rakesh@mern.space',
        password: 'password',

        tenantId: tenant.id,
        role: Roles.MANAGER,
      };

      // Add token to cookie
      await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(userData);

      const users = await prisma.user.findMany();

      expect(users).toHaveLength(1);
      expect(users[0]?.email).toBe(userData.email);
    });
  });
});
