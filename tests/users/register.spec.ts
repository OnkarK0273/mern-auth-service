import app from '@/app';
import { Roles } from '../../src/constants';
import { prisma } from '@/lib/prisma';
import request from 'supertest';
import { isJwt } from '../utils/index';

describe('Auth register', () => {
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

  describe('POST auth/register', () => {
    it('should return 201 status code', async () => {
      const userData = {
        firstName: 'dev',
        lastName: 'k',
        email: 'dev@email.com',
        password: 'password@123',
      };

      const response = await request(app).post('/auth/register').send(userData);

      expect(response.statusCode).toBe(201);
    });

    it('Should a valid json response', async () => {
      //AAA method

      //1. A - arrange
      const userData = {
        firstName: 'dev',
        lastName: 'k',
        email: 'dev@email.com',
        password: 'password@123',
      };

      // 2. A - act

      const response = await request(app).post('/auth/register').send(userData);

      // 3. A - accert

      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    it('Should persist user in database', async () => {
      //AAA method

      //A - arrange
      const userData = {
        firstName: 'dev',
        lastName: 'k',
        email: 'dev@email.com',
        password: 'password@123',
      };

      //A - act
      await request(app).post('/auth/register').send(userData);

      //A - accert

      const user = await prisma.user.findMany();
      expect(user).toHaveLength(1);
      expect(user[0]?.firstName).toBe(userData.firstName);
      expect(user[0]?.lastName).toBe(userData.lastName);
      expect(user[0]?.email).toBe(userData.email);
    });

    it('Should return id of new user id', async () => {
      //AAA method

      //A - arrange
      const userData = {
        firstName: 'dev',
        lastName: 'k',
        email: 'dev@email.com',
        password: 'password@123',
      };

      //A - act
      const response = await request(app).post('/auth/register').send(userData);

      // Assert
      expect(response.body).toHaveProperty('id');

      const users = await prisma.user.findMany();
      expect((response.body as Record<string, string>).id).toBe(users[0]?.id);
    });

    it('should assign a customer role', async () => {
      // Arrange
      const userData = {
        firstName: 'dev',
        lastName: 'k',
        email: 'dev@email.com',
        password: 'password@123',
      };
      // Act
      await request(app).post('/auth/register').send(userData);
      // Assert

      const users = await prisma.user.findMany();
      expect(users[0]).toHaveProperty('role');
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });

    it('should store the hashed password in the database', async () => {
      // Arrange
      const userData = {
        firstName: 'dev',
        lastName: 'k',
        email: 'dev@email.com',
        password: 'password@123',
      };
      // Act
      await request(app).post('/auth/register').send(userData);

      // Assert

      const users = await prisma.user.findMany();
      expect(users[0]?.password).not.toBe(userData.password);
      expect(users[0]?.password).toHaveLength(60);
      expect(users[0]?.password).toMatch(/^\$2[a|b]\$\d+\$/);
    });

    it('should return 400 status code if email is already exists', async () => {
      // Arrange
      const userData = {
        firstName: 'dev',
        lastName: 'k',
        email: 'dev@email.com',
        password: 'password@123',
      };

      // Act
      await prisma.user.create({ data: { ...userData, role: Roles.CUSTOMER } });
      const response = await request(app).post('/auth/register').send(userData);
      const users = await prisma.user.findMany();
      // Assert
      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(1);
    });

    it('should return the access token and refresh token inside a cookie', async () => {
      // Arrange
      const userData = {
        firstName: 'dev',
        lastName: 'k',
        email: 'dev@email.com',
        password: 'password@123',
      };

      // Act
      const response = await request(app).post('/auth/register').send(userData);

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

    it('should store the refresh token in the database', async () => {
      // Arrange
      const userData = {
        firstName: 'dev',
        lastName: 'k',
        email: 'dev@email.com',
        password: 'password@123',
      };

      // Act
      const response = await request(app).post('/auth/register').send(userData);
      const userID = (response.body as Record<string, string>).id;

      // Assert
      // Query the database using Prisma
      const tokens = await prisma.refreshToken.findMany({
        where: {
          userId: Number(userID),
        },
      });

      expect(tokens).toHaveLength(1);
    });
  });

  describe('fields are missing', () => {
    it('should return 400 status code if email field is missing', async () => {
      // Arrange
      const userData = {
        firstName: 'onkar',
        lastName: 'K',
        email: '',
        password: 'password@123',
      };
      // Act
      const response = await request(app).post('/auth/register').send(userData);

      // Assert
      expect(response.statusCode).toBe(400);

      const users = await prisma.user.findMany();
      expect(users).toHaveLength(0);
    });
    it('should return 400 status code if firstName is missing', async () => {
      // Arrange
      const userData = {
        firstName: '',
        lastName: 'K',
        email: 'onkar@gmail.com',
        password: 'password@123',
      };

      // Act
      const response = await request(app).post('/auth/register').send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
      const users = await prisma.user.findMany();
      expect(users).toHaveLength(0);
    });

    it('should return 400 status code if lastName is missing', async () => {
      // Arrange
      const userData = {
        firstName: 'onkar.k',
        lastName: '',
        email: 'onkar@gmail.com',
        password: 'password@123',
      };

      // Act
      const response = await request(app).post('/auth/register').send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
      const users = await prisma.user.findMany();
      expect(users).toHaveLength(0);
    });

    it('should return 400 status code if password is missing', async () => {
      // Arrange
      const userData = {
        firstName: 'onkar.k',
        lastName: 'k',
        email: 'onkar@gmail.com',
        password: '',
      };

      // Act
      const response = await request(app).post('/auth/register').send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
      const users = await prisma.user.findMany();
      expect(users).toHaveLength(0);
    });
  });

  describe('Fields are not in proper format', () => {
    it('should trim the email field', async () => {
      // Arrange
      const userData = {
        firstName: 'onkar',
        lastName: 'K',
        email: ' onkar@email.com ',
        password: 'password@123',
      };
      // Act
      await request(app).post('/auth/register').send(userData);

      // Assert
      const users = await prisma.user.findMany();
      const user = users[0];
      expect(user?.email).toBe('onkar@email.com');
    });
    it('should return 400 status code if email is not a valid email', async () => {
      // arrange
      const userData = {
        firstName: 'onkar.k',
        lastName: 'k',
        email: 'onakr-k-t',
        password: 'password@123@123',
      };

      // act
      const response = await request(app).post('/auth/register').send(userData);

      // assert
      expect(response.statusCode).toBe(400);
      const users = await prisma.user.findMany();
      expect(users).toHaveLength(0);
    });
    it('should return 400 status code if password length is less than 8 chars', async () => {
      // Arrange
      const userData = {
        firstName: 'onkar',
        lastName: 'K',
        email: ' onkar@email.com ',
        password: 'pass12',
      };
      // Act
      const response = await request(app).post('/auth/register').send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
      const users = await prisma.user.findMany();
      expect(users).toHaveLength(0);
    });
    it('shoud return an array of error messages if email is missing', async () => {
      // Arrange
      const userData = {
        firstName: 'Rakesh',
        lastName: 'K',
        email: '',
        password: 'password@123', // less than 8 chars
      };
      // Act
      const response = await request(app).post('/auth/register').send(userData);

      // Assert
      expect(response.body).toHaveProperty('errors');
      expect((response.body as Record<string, string>).errors.length).toBeGreaterThan(0);
    });
  });
});
