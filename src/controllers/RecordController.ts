import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { RecordService } from '../services/RecordService';
import { AuthGuard } from '../guards/AuthGuard';

@Controller('message')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Post()
  @UseGuards(AuthGuard) // Apply AuthGuard to protect the route
  async recordMessage(
    @Body() body: { userIdSend: string, userIdReceive: string, message: string },
  ) {
    await this.recordService.recordMessage(body);
    return { ok: true };
  }

  @Get()
  @UseGuards(AuthGuard) // Apply AuthGuard to protect the route
  async getMessages(
    @Query('user') userId: string,
  ) {
    const messages = await this.recordService.getMessages(userId);
    return messages;
  }
}
