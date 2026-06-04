import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateOrderDto) {
    return this.orders.create(req.user.userId, dto);
  }

  @Get('mine')
  mine(@Req() req) {
    return this.orders.findMine(req.user.userId);
  }

  // ---- Endpoints ADMIN (declarados antes de :id para evitar colision de rutas) ----

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.orders.findAll();
  }

  @Get('reports/today')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  today() {
    return this.orders.findToday();
  }

  @Get(':id')
  getOne(@Req() req, @Param('id') id: string) {
    return this.orders.getOne(id, req.user.userId, req.user.role);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.orders.updateStatus(id, status);
  }

  @Patch(':id/assign')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  assign(@Param('id') id: string, @Body('deliveryId') deliveryId: string) {
    return this.orders.assignDelivery(id, deliveryId);
  }
}
