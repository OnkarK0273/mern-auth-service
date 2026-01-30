import app from '@/app';
import { Roles } from '../../src/constants';
import { prisma } from '@/lib/prisma';
import request from 'supertest';
import { isJwt } from '../utils/index';
import bcrypt from 'bcryptjs';

describe('login register', () => {
  // 1. Connect before tests start
  beforeAll(async () => {
    await prisma.$connect();
  });

  // 2. Disconnect after tests end
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 3. Clear the DB before EVERY test to ensure isolation
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('Given all fields', () => {
    it('should return the access token and refresh token inside a cookie', async () => {
      // Arrange
      const userData = {
        firstName: 'dev',
        lastName: 'k',
        email: 'dev@email.com',
        password: 'password@123',
      };

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          role: Roles.CUSTOMER,
        },
      });

      // Act
      const response = await request(app)
        .post('/auth/login')
        .send({ email: userData.email, password: userData.password });

      interface Headers {
        ['set-cookie']: string[];
      }

      // Assert
      let accessToken = null;
      let refreshToken = null;
      const cookies = (response.headers as unknown as Headers)['set-cookie'] || [];
      cookies.forEach((cookie) => {
        if (cookie.startsWith('accessToken=')) {
          accessToken = cookie.split(';')[0].split('=')[1];
        }

        if (cookie.startsWith('refreshToken=')) {
          refreshToken = cookie.split(';')[0].split('=')[1];
        }
      });
      expect(accessToken).not.toBeNull();
      expect(refreshToken).not.toBeNull();

      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(refreshToken)).toBeTruthy();
    });
    it('should return the 400 if email or password is wrong', async () => {
      // Arrange
      const userData = {
        firstName: 'Rakesh',
        lastName: 'K',
        email: 'rakesh@mern.space',
        password: 'password',
      };

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          role: Roles.CUSTOMER,
        },
      });

      // Act
      const response = await request(app)
        .post('/auth/login')
        .send({ email: userData.email, password: 'wrongPassword' });

      // Assert

      expect(response.statusCode).toBe(400);
    });
  });
});
