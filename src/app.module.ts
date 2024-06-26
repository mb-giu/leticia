import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/AuthController';
import { ReceiveSendController } from './controllers/ReceiveSendController';
import { RecordController } from './controllers/RecordController';
import { AuthService } from './services/AuthService';
import { MessageService } from './services/MessageService';
import { RecordService } from './services/RecordService';
import { AuthClient } from './clients/AuthClient';
import { RecordClient } from './clients/RecordClient';
import { User } from './models/User';
import { Message } from './models/Message';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'baleia',
      database: process.env.DB_DATABASE || 'chat',
      entities: [User, Message],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Message]),
    JwtModule.register({ secret: 'baleia', signOptions: { expiresIn: '24h' } }),
  ],
  controllers: [AuthController, ReceiveSendController, RecordController],
  providers: [AuthService, MessageService, RecordService, AuthClient, RecordClient],
})
export class AppModule {}
