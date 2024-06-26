import { Injectable } from '@nestjs/common';
import { Message } from '../models/Message';

@Injectable()
export class RecordService {
  async recordMessage(body: { userIdSend: string, userIdReceive: string, message: string }) {
    const message = new Message();
    message.userIdSend = body.userIdSend;
    message.userIdReceive = body.userIdReceive;
    message.message = body.message;
    await message.save();
  }

  async getMessages(userId: string): Promise<Message[]> {
    return await Message.find({ where: { userIdReceive: userId } });
  }
}
