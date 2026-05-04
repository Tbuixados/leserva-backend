import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import type { StringValue } from 'ms';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Generamos un token único para verificar el email
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      verificationToken,
      isVerified: false,
    });

    // Mandamos el email de verificación
    await this.notificationsService.sendEmailVerification({
      email: user.email,
      name: user.firstName,
      token: verificationToken,
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isValid = await this.validatePassword(
      dto.password,
      user.passwordHash,
    );
    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.generateTokens(user);
  }

  async refresh(refreshToken: string) {
    const user = await this.usersService.findByRefreshToken(refreshToken);

    if (!user) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    // Verificar que el refresh token no esté expirado
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      // Si expiró, lo invalidamos en la DB y pedimos login de nuevo
      await this.usersService.updateRefreshToken(user.id, null);
      throw new UnauthorizedException('Refresh token expirado');
    }

    return this.generateTokens(user);
  }

  async logout(userId: string): Promise<void> {
    // Invalidamos el refresh token en la DB para que no pueda usarse más
    await this.usersService.updateRefreshToken(userId, null);
  }

  // Verifica el token de email y activa la cuenta del usuario
  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.usersService.findByVerificationToken(token);

    if (!user) {
      throw new BadRequestException(
        'Token de verificación inválido o expirado',
      );
    }

    await this.usersService.markAsVerified(user.id);

    return { message: 'Email verificado correctamente' };
  }

  // Genera access token (15min) y refresh token (7 días)
  generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>(
        'jwt.accessExpiresIn',
      ) as StringValue,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>(
        'jwt.refreshExpiresIn',
      ) as StringValue,
    });

    // Guardamos el refresh token en la DB para poder invalidarlo en logout
    void this.usersService.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  // Compara password en texto plano con el hash de la DB
  private async validatePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
