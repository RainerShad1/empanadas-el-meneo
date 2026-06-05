import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DeliveriesService } from './deliveries.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('deliveries')
export class DeliveriesController {
  constructor(private deliveries: DeliveriesService) {}

  @Get()
  findAll() {
    return this.deliveries.findActive();
  }

  @Post()
  create(@Body() body: { nombre: string; telefono: string }) {
    return this.deliveries.create(body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliveries.remove(id);
  }
}
