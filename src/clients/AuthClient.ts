import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthClient {
  async verifyAuth(token: string, userId: string) {
    const response = await axios.get(`http://localhost:3000/token?user=${userId}`, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  }

  async getUsers() {
    const response = await axios.get('http://localhost:3000/token/users');
    return response.data;
  }
}
