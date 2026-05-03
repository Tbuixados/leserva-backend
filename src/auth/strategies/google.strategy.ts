import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { UsersService } from '../../users/users.service';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: configService.get<string>('google.clientId')!,
      clientSecret: configService.get<string>('google.clientSecret')!,
      callbackURL: configService.get<string>('google.callbackUrl')!,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0].value;
    const googleId = profile.id;
    const firstName = profile.name?.givenName ?? '';
    const lastName = profile.name?.familyName ?? '';
    const avatarUrl = profile.photos?.[0].value;

    if (!email) {
      return done(new Error('No se pudo obtener el email de Google'), false);
    }

    // Buscar si el usuario ya existe por googleId o email
    let user = await this.usersService.findByGoogleId(googleId);

    if (!user) {
      user = await this.usersService.findByEmail(email);
    }

    if (!user) {
      // Crear usuario nuevo con datos de Google
      user = await this.usersService.create({
        email,
        firstName,
        lastName,
        googleId,
        avatarUrl,
        role: UserRole.CLIENT,
      });
    } else if (!user.googleId) {
      // Usuario existente con email pero sin googleId → vincular cuenta
      await this.usersService.linkGoogleAccount(user.id, googleId);
    }

    done(null, user);
  }
}
