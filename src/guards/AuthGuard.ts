import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/AuthService';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header not found');
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    const userId = request.query.user || request.body.userIdSend; // Adjust this as per your needs
    const isAuthenticated = await this.authService.verifyToken(token, userId);
    if (!isAuthenticated) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = { userId }; // Add user info to request object if needed
    return true;
  }
}
