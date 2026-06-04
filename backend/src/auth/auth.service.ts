import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const cedula = dto.cedula.replace(/-/g, '');
    const exists = await this.prisma.user.findUnique({ where: { cedula } });
    if (exists) throw new ConflictException('La cedula ya esta registrada');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        cedula,
        password: hash,
        nombre: dto.nombre,
        telefono: dto.telefono,
      },
    });
    return this.sign(user.id, user.role);
  }

  async login(dto: LoginDto) {
    const cedula = dto.cedula.replace(/-/g, '');
    const user = await this.prisma.user.findUnique({ where: { cedula } });
    if (!user) throw new UnauthorizedException('Credenciales invalidas');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Credenciales invalidas');

    return this.sign(user.id, user.role);
  }

  private sign(userId: string, role: string) {
    const payload = { sub: userId, role };
    return {
      access_token: this.jwt.sign(payload, { expiresIn: '7d' }),
      role,
    };
  }
}
