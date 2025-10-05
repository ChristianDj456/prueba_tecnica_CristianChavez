import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async validateUser({ email, password }: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');
    return user;
  }

  async login(dto: LoginDto) {
    const u = await this.validateUser(dto);
    const payload = { sub: u.id, email: u.email, role: u.role };
    const access_token = await this.jwt.signAsync(payload);
    return { access_token, user: { id: u.id, email: u.email, role: u.role } };
  }
}
