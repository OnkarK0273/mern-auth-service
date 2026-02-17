import { UpdateUserData, UserData, UserQueryParams } from '../types/index';
import { Prisma, PrismaClient } from 'generated/prisma/client';
import createHttpError from 'http-errors';
import bcrypt from 'bcryptjs';
export class UserService {
  constructor(private prisma: PrismaClient) {}

  async create({ firstName, lastName, email, password, role, tenantId }: UserData) {
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
          tenantId: tenantId ?? null,
        },
      });
    } catch (err) {
      const error = createHttpError(500, 'Failed to store the data in the database');
      throw error;
    }
  }

  async update(userId: number, userData: UpdateUserData) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: userData,
    });
  }

  async get(validatedQuery: UserQueryParams) {
    const { currentPage, perPage, q, role } = validatedQuery;

    // Build the where clause dynamically
    const where: Prisma.UserWhereInput = {
      AND: [],
    };

    // Handle Search (Name or Email)
    if (q) {
      const searchTerms = q.trim().split(/\s+/); // Splits "John Doe" into ["John", "Doe"]

      (where.AND as Prisma.UserWhereInput[]).push({
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          {
            // Matches if BOTH parts appear across the name fields
            AND: searchTerms.map((term) => ({
              OR: [
                { firstName: { contains: term, mode: 'insensitive' } },
                { lastName: { contains: term, mode: 'insensitive' } },
              ],
            })),
          },
        ],
      });
    }

    // Handle Role Filter
    if (role) {
      (where.AND as Prisma.UserWhereInput[]).push({ role });
    }

    const [users, totalCount] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: { tenant: true },
        omit: { password: true },
        skip: (currentPage - 1) * perPage,
        take: perPage,
        orderBy: { id: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return [users, totalCount];
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

  async findById(id: number) {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        tenant: true,
      },
    });
  }

  async deleteById(userId: number) {
    return this.prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }
}
