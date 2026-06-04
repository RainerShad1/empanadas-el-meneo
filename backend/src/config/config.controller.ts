import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { BusinessConfigService } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private config: BusinessConfigService) {}

  // Publico: el cliente consulta si esta abierto
  @Get()
  async get() {
    const cfg = await this.config.get();
    const abiertoAhora = await this.config.isOpen();
    return { ...cfg, abiertoAhora };
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Body()
    body: Partial<{ horaApertura: string; horaCierre: string; abierto: boolean }>,
  ) {
    return this.config.update(body);
  }
}
