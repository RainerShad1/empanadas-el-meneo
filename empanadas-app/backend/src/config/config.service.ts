import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BusinessConfigService {
  constructor(private prisma: PrismaService) {}

  async get() {
    // upsert para garantizar que siempre exista la fila id=1
    return this.prisma.businessConfig.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
  }

  async isOpen(): Promise<boolean> {
    const cfg = await this.get();
    if (!cfg.abierto) return false; // cierre manual

    const now = new Date();
    const hhmm = now.toTimeString().slice(0, 5); // "HH:mm"
    return hhmm >= cfg.horaApertura && hhmm <= cfg.horaCierre;
  }

  update(
    data: Partial<{ horaApertura: string; horaCierre: string; abierto: boolean }>,
  ) {
    return this.prisma.businessConfig.update({ where: { id: 1 }, data });
  }
}
