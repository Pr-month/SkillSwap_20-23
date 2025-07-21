import { Column, Entity, PrimaryColumn } from 'typeorm';

export type Gender = 'male' | 'female';
type Role = 'USER' | 'ADMIN';

@Entity()
export class User {
  @PrimaryColumn({ type: 'uuid' })
  id: string;
  @Column({ type: 'text' })
  name: string;
  @Column({ type: 'text' })
  email: string;
  @Column({ type: 'text' })
  password: string;
  @Column({ type: 'int' })
  age: number;
  @Column({ type: 'text' })
  city: string;
  @Column({ type: 'text' })
  about: string;
  @Column({
    type: 'enum',
    enum: ['male', 'female'],
  })
  gender: Gender;
  @Column({ type: 'text' })
  avatar: string;
  @Column({
    type: 'enum',
    enum: ['ADMIN', 'USER'],
  })
  role: Role;
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true, // Добавляем nullable 
  })
  refreshToken?: string; // Делаем поле опциональным
}