import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class MessageService {
  private readonly queueUrl = 'amqp://localhost';

  async sendToQueue(message: { queue: string, message: string }) {
    const connection = await amqp.connect(this.queueUrl);
    const channel = await connection.createChannel();
    await channel.assertQueue(message.queue, { durable: true });
    channel.sendToQueue(message.queue, Buffer.from(message.message));
    await channel.close();
    await connection.close();
  }

  async readFromQueue(queue: string): Promise<string[]> {
    const connection = await amqp.connect(this.queueUrl);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });

    const messages: string[] = [];
    await channel.consume(queue, (msg) => {
      if (msg !== null) {
        messages.push(msg.content.toString());
        channel.ack(msg);
      }
    });

    await channel.close();
    await connection.close();

    return messages;
  }
}
