import { UserData } from '../types/index';
import { PrismaClient } from 'generated/prisma/client';
import createHttpError from 'http-errors';
import bcrypt from 'bcryptjs';
export class UserService {
  constructor(private prisma: PrismaClient) {}

  async create({ firstName, lastName, email, password, role }: UserData) {
    // Note: Ensure 'email' is marked as @unique in your schema.prisma
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      const err = createHttpError(400, 'Email already exists');
      throw err;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    try {
      return this.prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          role,
        },
      });
    } catch (err) {
      const error = createHttpError(500, 'Failed to store the data in the database');
      throw error;
    }
  }

  async findByEmailWithPassword(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        password: true,
      },
    });
  }
}
