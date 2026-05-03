import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Inicia el flujo de login con Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Passport redirige automáticamente a Google, este método no ejecuta nada
  }

  // Google redirige acá después de que el usuario autoriza
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as User;
    const { accessToken } = this.authService.generateTokens(user);

    // Redirigir al frontend con el token en la URL
    // El frontend lo extrae y lo guarda en memoria
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/google/callback?token=${accessToken}`,
    );
  }
}
