import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessConfigService } from '../config/config.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersGateway } from './orders.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private config: BusinessConfigService,
    private gateway: OrdersGateway,
  ) {}

  private async generarNumero(tx: Prisma.TransactionClient): Promise<string> {
    const count = await tx.order.count();
    return `PED-${String(count + 1).padStart(6, '0')}`;
  }

  async create(userId: string, dto: CreateOrderDto) {
    // 1. Validar que el negocio este abierto
    if (!(await this.config.isOpen())) {
      throw new BadRequestException('El negocio esta cerrado en este momento');
    }

    // 2. Validar direccion del usuario
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId },
    });
    if (!address) throw new NotFoundException('Direccion invalida');

    // 3. Traer productos y validar que esten activos
    const ids = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: ids }, activo: true },
    });
    if (products.length !== ids.length) {
      throw new BadRequestException('Algun producto no esta disponible');
    }

    // 4. Calcular total con snapshot de precios (en el servidor, nunca confiar en el cliente)
    const priceMap = new Map(products.map((p) => [p.id, p.precio]));
    let total = new Prisma.Decimal(0);
    const itemsData = dto.items.map((i) => {
      const precioUnit = priceMap.get(i.productId)!;
      total = total.add(precioUnit.mul(i.cantidad));
      return {
        productId: i.productId,
        cantidad: i.cantidad,
        precioUnit,
      };
    });

    // 5. Crear en transaccion
    const order = await this.prisma.$transaction(async (tx) => {
      const numero = await this.generarNumero(tx);
      return tx.order.create({
        data: {
          numero,
          userId,
          addressId: dto.addressId,
          nota: dto.nota,
          total,
          items: { create: itemsData },
        },
        include: {
          items: { include: { product: true } },
          user: true,
          address: true,
        },
      });
    });

    // 6. Notificar al panel admin en tiempo real (sonido + dashboard)
    this.gateway.notifyNewOrder(order);

    return order;
  }

  findMine(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } }, delivery: true },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        user: true,
        address: true,
        delivery: true,
      },
    });
  }

  findToday() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return this.prisma.order.findMany({
      where: { createdAt: { gte: start } },
      include: { items: true, user: true },
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    const exists = await this.prisma.order.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Pedido no encontrado');

    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: { include: { product: true } },
        user: true,
        address: true,
        delivery: true,
      },
    });

    // Notificar al cliente en tiempo real
    this.gateway.notifyStatusChange(order);
    return order;
  }

  async assignDelivery(id: string, deliveryId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
    });
    if (!delivery) throw new NotFoundException('Delivery no encontrado');

    const order = await this.prisma.order.update({
      where: { id },
      data: { deliveryId, status: OrderStatus.EN_CAMINO },
      include: {
        items: { include: { product: true } },
        user: true,
        address: true,
        delivery: true,
      },
    });
    this.gateway.notifyStatusChange(order);
    return order;
  }

  async getOne(id: string, userId: string, role: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: true,
        address: true,
        delivery: true,
      },
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    // Un cliente solo puede ver sus propios pedidos
    if (role !== 'ADMIN' && order.userId !== userId) {
      throw new ForbiddenException();
    }
    return order;
  }
}
