import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // Publico: categorias activas, ordenadas
  findActive() {
    return this.prisma.category.findMany({
      where: { activa: true },
      orderBy: { orden: 'asc' },
    });
  }

  // Admin: todas
  findAll() {
    return this.prisma.category.findMany({ orderBy: { orden: 'asc' } });
  }

  create(data: { nombre: string; orden?: number }) {
    return this.prisma.category.create({
      data: { nombre: data.nombre, orden: data.orden ?? 0 },
    });
  }

  async update(id: string, data: { nombre?: string; orden?: number }) {
    const exists = await this.prisma.category.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Categoria no encontrada');
    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: string) {
    const exists = await this.prisma.category.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Categoria no encontrada');
    // Al borrar, los productos quedan con categoryId = null (sin categoria),
    // no se borran. Primero los desvinculamos.
    await this.prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
    await this.prisma.category.delete({ where: { id } });
    return { ok: true };
  }
}
