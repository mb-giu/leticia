import { Controller, Get, Post, Body, Query, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/AuthService';

@Controller('token')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  async verifyToken(
    @Query('user') userId: string,
    @Headers('Authorization') authHeader: string,
  ) {
    const token = authHeader?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }
    const isAuthenticated = await this.authService.verifyToken(token, userId);
    return { auth: isAuthenticated };
  }

  @Post()
  async getToken(
    @Body() body: { email: string, password: string },
  ) {
    const token = await this.authService.getToken(body.email, body.password);
    if (!token) {
      return { token: false };
    }
    return { token };
  }

  @Post('user')
  async createUser(
    @Body() body: { name: string, lastName: string, email: string, password: string },
  ) {
    const user = await this.authService.createUser(body);
    return { message: 'ok', user };
  }

  @Get('user')
  async getUser(@Query('email') email: string) {
    const user = await this.authService.getUser(email);
    return user;
  }
}
