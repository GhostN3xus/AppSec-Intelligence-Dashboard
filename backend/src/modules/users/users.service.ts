import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    status: true,
    language: true,
    title: true,
    lastLogin: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  findAll() {
    return this.prisma.user.findMany({ select: this.userSelect });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id }, select: this.userSelect });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserDto) {
    const hash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hash,
      },
      select: this.userSelect,
    });
  }

  async update(id: string, data: UpdateUserDto) {
    const payload: any = { ...data };
    if (data.password) {
      payload.password = await bcrypt.hash(data.password, 10);
    }
    return this.prisma.user.update({ where: { id }, data: payload, select: this.userSelect });
  }

  delete(id: string) {
    return this.prisma.user.delete({ where: { id }, select: this.userSelect });
  }
}
