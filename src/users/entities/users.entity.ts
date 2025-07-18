import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Gender } from '../../common/gender.enum';
import { Role } from '../../common/role.enum';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'varchar' })
  city: string;

  @Column({
    type: 'enum',
    enum: ['male', 'female'],
  })
  gender: Gender;

  @Column({ type: 'varchar' })
  avatar: string;

  @Column({
    type: 'enum',
    enum: ['USER', 'ADMIN'],
  })
  role: Role;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  refreshtoken: string;
}
