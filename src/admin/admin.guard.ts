import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AdminGuard extends JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Primero verifica el JWT
    await super.canActivate(context);

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: User }>();
    const user = request.user;

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Acceso restringido a administradores');
    }

    return true;
  }
}
