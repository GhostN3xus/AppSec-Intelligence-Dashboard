import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
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
    });
  }

  async update(id: string, data: UpdateUserDto) {
    const payload: any = { ...data };
    if (data.password) {
      payload.password = await bcrypt.hash(data.password, 10);
    }
    return this.prisma.user.update({ where: { id }, data: payload });
  }

  delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
