import { TenantData, TenantQueryParams } from '../types';
import { Prisma, PrismaClient } from 'generated/prisma/client';

export class TenantService {
  constructor(private prisma: PrismaClient) {}

  async create({ name, address }: TenantData) {
    return this.prisma.tenant.create({ data: { name, address } });
  }

  async update(tenantId: number, tenantData: TenantData) {
    return this.prisma.tenant.update({
      where: {
        id: tenantId,
      },
      data: tenantData,
    });
  }

  async get(validatedQuery: TenantQueryParams) {
    const { currentPage, perPage, q } = validatedQuery;

    // Initialize strictly typed where object
    const where: Prisma.TenantWhereInput = {
      AND: [],
    };

    // Handle Search (Name or Address if applicable)
    if (q) {
      (where.AND as Prisma.TenantWhereInput[]).push({
        OR: [{ name: { contains: q, mode: 'insensitive' } }, { address: { contains: q, mode: 'insensitive' } }],
      });
    }

    const [tenants, totalCount] = await this.prisma.$transaction([
      this.prisma.tenant.findMany({
        where,
        skip: (currentPage - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' }, // Keeps newest tenants at the top
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return [tenants, totalCount];
  }

  async getById(tenantId: number) {
    return this.prisma.tenant.findFirst({
      where: {
        id: tenantId,
      },
    });
  }

  async deleteById(tenantId: number) {
    return this.prisma.tenant.delete({
      where: {
        id: tenantId,
      },
    });
  }
}
