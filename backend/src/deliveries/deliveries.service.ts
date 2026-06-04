import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeliveriesService {
  constructor(private prisma: PrismaService) {}

  findActive() {
    return this.prisma.delivery.findMany({ where: { activo: true } });
  }

  create(data: { nombre: string; telefono: string }) {
    return this.prisma.delivery.create({ data });
  }

  async remove(id: string) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id } });
    if (!delivery) throw new NotFoundException('Delivery no encontrado');

    // Si ya tiene pedidos asociados, no se borra fisicamente (rompe historial):
    // soft delete (lo marcamos inactivo). Si no, borrado real.
    const pedidos = await this.prisma.order.count({ where: { deliveryId: id } });
    if (pedidos > 0) {
      await this.prisma.delivery.update({
        where: { id },
        data: { activo: false },
      });
    } else {
      await this.prisma.delivery.delete({ where: { id } });
    }
    return { ok: true };
  }
}
