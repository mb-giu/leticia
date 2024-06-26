import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userIdSend: string;

  @Column()
  userIdReceive: string;

  @Column()
  message: string;
}
