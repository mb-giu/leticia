import { Controller, Post, Get, Body, Query, Headers, UseGuards, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from '../services/AuthService';
import { RecordService } from '../services/RecordService';
import { AuthGuard } from '../guards/AuthGuard';
import { MessageService } from '../services/MessageService';

@Controller('message')
export class ReceiveSendController {
  private readonly logger = new Logger(ReceiveSendController.name);

  constructor(
    private readonly recordService: RecordService,
    private readonly authService: AuthService,
    private readonly messageService: MessageService,
  ) {}

  @Post('send')
  async sendMessage(@Body() body: { userIdSend: string, userIdReceive: string, message: string }, @Headers('authorization') authHeader: string) {
    this.logger.debug(`sendMessage called with body: ${JSON.stringify(body)}`);

    const token = authHeader?.split(' ')[1];
    if (!token) {
      this.logger.error('Token not provided');
      throw new UnauthorizedException('Token not provided');
    }
    this.logger.debug(`Extracted token: ${token}`);

    const isAuthenticated = await this.authService.verifyToken(token, body.userIdSend);
    if (!isAuthenticated) {
      this.logger.error('Invalid token');
      throw new UnauthorizedException('Invalid token');
    }

    await this.messageService.sendToQueue({
      queue: 'message_queue',
      message: JSON.stringify(body),
    });

    await this.recordService.recordMessage({
      userIdSend: body.userIdSend,
      userIdReceive: body.userIdReceive,
      message: body.message,
    });
  }

  @Post('worker')
  @UseGuards(AuthGuard)
  async messageWorker(
    @Body() body: { userIdSend: string, userIdReceive: string },
    @Headers('Authorization') authHeader: string,
  ) {
    const token = authHeader.split(' ')[1];
    const userIdSend = body.userIdSend;
    const isAuthenticated = await this.authService.verifyToken(token, userIdSend);
    if (!isAuthenticated) {
      throw new UnauthorizedException('Invalid token');
    }

    // Read messages from the queue and record them in the database
    const messages = await this.messageService.readFromQueue(`${body.userIdSend}${body.userIdReceive}`);
    for (const message of messages) {
      await this.recordService.recordMessage({
        userIdSend: body.userIdSend,
        userIdReceive: body.userIdReceive,
        message: message,
      });
    }

    return { msg: 'ok' };
  }

  @Get()
  @UseGuards(AuthGuard)
  async getMessages(
    @Query('user') userId: string,
    @Headers('Authorization') authHeader: string,
  ) {
    const token = authHeader.split(' ')[1];
    const isAuthenticated = await this.authService.verifyToken(token, userId);
    if (!isAuthenticated) {
      throw new UnauthorizedException('Invalid token');
    }

    // Retrieve messages from the database
    const messages = await this.recordService.getMessages(userId);
    return messages;
  }
}
