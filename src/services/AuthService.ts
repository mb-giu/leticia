import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../models/User';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwtService: JwtService) {}

  async verifyToken(token: string, userId: string): Promise<boolean> {
    this.logger.debug('Verifying token');
    try {
      if (!token) {
        throw new UnauthorizedException('Token not provided');
      }
      const decoded = this.jwtService.verify(token, { secret: 'baleia' });
      this.logger.debug(`Decoded token: ${JSON.stringify(decoded)}`);
      
      const decodedUserId = decoded.userId;
      this.logger.debug(`Comparing decoded userId: ${decodedUserId} with provided userId: ${userId}`);
      const isValid = decodedUserId == userId;
      this.logger.debug(`Token is valid: ${isValid}`);
      
      return isValid;
    } catch (error) {
      this.logger.error(`Error verifying token: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }
  
  async getToken(email: string, password: string): Promise<string | null> {
    this.logger.debug(`Getting token for email: ${email}`);
    const user = await User.findOne({ where: { email, password } });
    if (!user) {
      this.logger.debug('User not found');
      return null;
    }

    const token = this.jwtService.sign({ userId: user.id });
    this.logger.debug(`Generated token: ${token}`);
    return token;
  }

  async createUser(data: { name: string; lastName: string; email: string; password: string }): Promise<User> {
    this.logger.debug(`Creating user with data: ${JSON.stringify(data)}`);
    const user = new User();
    user.name = data.name;
    user.lastName = data.lastName;
    user.email = data.email;
    user.password = data.password;
    await user.save();
    this.logger.debug(`User created: ${JSON.stringify(user)}`);
    return user;
  }

  async getUser(email: string): Promise<User | null> {
    this.logger.debug(`Getting user by email: ${email}`);
    const user = await User.findOne({ where: { email } });
    this.logger.debug(`User found: ${JSON.stringify(user)}`);
    return user;
  }
}
