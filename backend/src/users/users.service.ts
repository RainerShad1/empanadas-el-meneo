import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddressDto } from './dto/address.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        cedula: true,
        nombre: true,
        telefono: true,
        role: true,
        addresses: { where: { activa: true } },
      },
    });
  }

  listAddresses(userId: string) {
    // Solo direcciones activas (no las ocultadas por soft delete)
    return this.prisma.address.findMany({
      where: { userId, activa: true },
    });
  }

  addAddress(userId: string, dto: AddressDto) {
    return this.prisma.address.create({ data: { ...dto, userId } });
  }

  async removeAddress(userId: string, addressId: string) {
    const addr = await this.prisma.address.findFirst({
      where: { id: addressId, userId }, // garantiza que sea del usuario
    });
    if (!addr) throw new NotFoundException('Direccion no encontrada');

    // Si la direccion ya fue usada en algun pedido, no se puede borrar
    // fisicamente (rompe el historial). En ese caso, soft delete: la ocultamos.
    const pedidosConEsta = await this.prisma.order.count({
      where: { addressId },
    });

    if (pedidosConEsta > 0) {
      await this.prisma.address.update({
        where: { id: addressId },
        data: { activa: false },
      });
    } else {
      // Sin pedidos asociados: borrado real
      await this.prisma.address.delete({ where: { id: addressId } });
    }
    return { ok: true };
  }
}
