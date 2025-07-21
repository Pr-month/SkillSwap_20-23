import { Column, Entity, PrimaryColumn } from 'typeorm';

import { Gender } from '../../common/gender.enum';
import { Role } from '../../common/role.enum';

@Entity()
export class User {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

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
    enum: Gender,
  })
  gender: Gender;

  @Column({ type: 'varchar' })
  avatar: string;

  @Column({ type: 'varchar', nullable: true })
  about: string | null;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  refreshtoken: string;
}
