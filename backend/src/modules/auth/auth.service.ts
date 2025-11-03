import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { addHours } from 'date-fns';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, password: string, ip?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      await this.logLoginAttempt(email, false, undefined, ip, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status === 'suspended') {
      await this.logLoginAttempt(email, false, user.id, ip, userAgent);
      throw new UnauthorizedException('Usuário suspenso');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      await this.logLoginAttempt(email, false, user.id, ip, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.logLoginAttempt(email, true, user.id, ip, userAgent);
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
    return user;
  }

  async login(email: string, password: string, ip?: string, userAgent?: string) {
    const user = await this.validateUser(email, password, ip, userAgent);
    return {
      access_token: await this.signToken(user.id, user.email, user.role),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        language: user.language,
        title: user.title,
        status: user.status,
      },
    };
  }

  async register(input: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new BadRequestException('E-mail já registrado.');
    }
    const hash = await bcrypt.hash(input.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        password: hash,
        name: input.name,
        role: input.role ?? UserRole.analyst,
        language: input.language,
        title: input.title,
      },
    });
    return {
      access_token: await this.signToken(user.id, user.email, user.role),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        language: user.language,
        title: user.title,
        status: user.status,
      },
    };
  }

  async signToken(id: string, email: string, role: string) {
    const payload = { sub: id, email, role };
    return this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRATION'),
    });
  }

  async profile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const { password, ...safe } = user;
    return safe;
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.title !== undefined) payload.title = data.title;
    if (data.language !== undefined) payload.language = data.language;
    if (data.role !== undefined) payload.role = data.role;
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: payload,
    });
    const { password, ...safe } = user;
    return safe;
  }

  async forgotPassword({ email }: ForgotPasswordDto, ip?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      await this.logLoginAttempt(email, false, undefined, ip, userAgent);
      return { message: 'Se existir uma conta, enviaremos instruções.' };
    }
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const record = await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: addHours(new Date(), 1),
      },
    });
    return {
      message: 'Token de redefinição gerado.',
      resetToken: `${record.id}.${rawToken}`,
    };
  }

  async resetPassword({ token, password }: ResetPasswordDto) {
    const [id, rawToken] = token.split('.');
    if (!id || !rawToken) {
      throw new BadRequestException('Token inválido');
    }
    const record = await this.prisma.passwordResetToken.findUnique({ where: { id } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Token expirado ou inválido');
    }
    const match = await bcrypt.compare(rawToken, record.tokenHash);
    if (!match) {
      throw new BadRequestException('Token inválido');
    }
    const hash = await bcrypt.hash(password, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { password: hash } }),
      this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);
    return { message: 'Senha atualizada com sucesso.' };
  }

  private async logLoginAttempt(email: string, success: boolean, userId?: string, ip?: string, userAgent?: string) {
    await this.prisma.loginLog.create({
      data: {
        email,
        success,
        userId,
        ip,
        userAgent,
      },
    });
  }
}
