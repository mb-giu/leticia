import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RecordClient {
  async recordMessage(userIdSend: string, userIdReceive: string, message: string) {
    await axios.post('http://localhost:3000/message', {
      userIdSend,
      userIdReceive,
      message,
    });
  }

  async recordMessages(messages: any[]) {
    await axios.post('http://localhost:3000/message/worker', {
      messages,
    });
  }

  async getMessages(userId: string) {
    const response = await axios.get(`http://localhost:3000/message?user=${userId}`);
    return response.data;
  }
}
