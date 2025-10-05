import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return u;
  }

  async create(dto: CreateUserDto) {
    const password = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { email: dto.email, password, role: dto.role },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    if (dto.password) dto.password = await bcrypt.hash(dto.password, 10);
    try {
      return await this.prisma.user.update({ where: { id }, data: dto });
    } catch {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.user.delete({ where: { id } });
      return { ok: true };
    } catch {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
