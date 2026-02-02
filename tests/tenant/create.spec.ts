import app from '@/app';
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
    it('should return a 201 status code', async () => {
      const tenantData = {
        name: 'Tenant name',
        address: 'Tenant address',
      };
      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData);

      expect(response.statusCode).toBe(201);
    });

    it('should create a tenant in the database', async () => {
      const tenantData = {
        name: 'Tenant name',
        address: 'Tenant address',
      };

      await request(app).post('/tenants').send(tenantData);
      await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData);

      const tenants = await prisma.tenant.findMany();
      expect(tenants).toHaveLength(1);
      expect(tenants[0]?.name).toBe(tenantData.name);
      expect(tenants[0]?.address).toBe(tenantData.address);
    });

    it('should return 401 if user is not autheticated', async () => {
      const tenantData = {
        name: 'Tenant name',
        address: 'Tenant address',
      };

      const response = await request(app).post('/tenants').send(tenantData);
      expect(response.statusCode).toBe(401);

      const tenants = await prisma.tenant.findMany();

      expect(tenants).toHaveLength(0);
    });
  });
});
