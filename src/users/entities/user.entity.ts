import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Category } from '../../categories/entities/category.entity';
import { Gender, Role } from '../../common/types';
import { Skill } from '../../skills/entities/skill.entity';
import { Request } from '../../requests/entities/request.entity';
import { ApiProperty } from '@nestjs/swagger';

// @Exclude() // По умолчанию все поля исключены
// @Expose() // Явно указываем, что поле нужно включать

@Entity('user')
export class User {
  @PrimaryColumn({ type: 'uuid' })
  @ApiProperty({
    example: 'b1a3e57c-8af0-4df0-9d85-0d6f92c8f3ad',
    description: 'Уникальный идентификатор пользователя',
  })
  id: string = uuidv4();

  @Column({ type: 'text' })
  @ApiProperty({
    example: 'alex',
    description: 'Имя пользователя',
  })
  name: string;

  @Column({ type: 'text', unique: true })
  @ApiProperty({
    example: 'alex@example.com',
    description: 'Email пользователя',
  })
  email: string;

  @Column({ type: 'text' })
  @Exclude()
  password: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    example: 'Customer',
    description: 'Краткая информация о пользователе',
    nullable: true,
  })
  about: string | null = null;

  @Column({
    type: 'date',
    nullable: true,
  })
  @ApiProperty({
    example: '1990-01-01',
    description: 'Дата рождения',
  })
  birthDate: Date | null = null;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    example: 'Tokio',
    description: 'Город',
  })
  city: string | null = null;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  @ApiProperty({
    example: 'male',
    description: 'пол',
  })
  gender: Gender;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    example: 'avatar.png',
    description: 'аватар пользователя',
  })
  avatar: string;

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
    nullable: true,
  })
  @Exclude()
  refreshToken: string | null;

  @OneToMany(() => Skill, (skill) => skill.owner, {
    cascade: true,
  })
  skills?: Skill[];

  // Добавляем связи с заявками
  @OneToMany(() => Request, (request) => request.sender)
  sentRequests?: Request[];

  @OneToMany(() => Request, (request) => request.receiver)
  receivedRequests?: Request[];

  @ManyToMany(() => Skill, { eager: true })
  @JoinTable()
  favoriteSkills?: Skill[];

  @ManyToMany(() => Category, { eager: true })
  @JoinTable()
  @ApiProperty({
    type: () => [Category],
    description: 'Список категорий, которые пользователь хочет изучать',
    example: [],
  })
  wantToLearn?: Category[];
}
