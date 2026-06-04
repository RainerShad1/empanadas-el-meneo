import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // Publico: solo productos activos
  findActive() {
    return this.prisma.product.findMany({
      where: { activo: true },
      include: { category: true },
      orderBy: { nombre: 'asc' },
    });
  }

  // Admin: todos
  findAll() {
    return this.prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  async update(id: string, dto: UpdateProductDto) {
    const exists = await this.prisma.product.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Producto no encontrado');
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const exists = await this.prisma.product.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Producto no encontrado');

    // Si el producto ya esta en algun pedido, no se puede borrar fisicamente
    // (romperia el historial de pedidos). En ese caso lo desactivamos.
    const enPedidos = await this.prisma.orderItem.count({
      where: { productId: id },
    });

    if (enPedidos > 0) {
      await this.prisma.product.update({
        where: { id },
        data: { activo: false },
      });
      return { ok: true, soft: true };
    }
    await this.prisma.product.delete({ where: { id } });
    return { ok: true, soft: false };
  }
}
