import { TenantData } from '../types';
import { PrismaClient } from 'generated/prisma/client';

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

  async get() {
    return this.prisma.tenant.findMany();
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
