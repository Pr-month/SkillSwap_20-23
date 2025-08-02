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
import { Category } from '../../categories/entities/category.entity';
import { Request } from '../../requests/entities/request.entity';

// @Exclude() // По умолчанию все поля исключены
// @Expose() // Явно указываем, что поле нужно включать

@Entity('user')
export class User {
  @PrimaryColumn({ type: 'uuid' })
  id: string = uuidv4();

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  @Exclude()
  password: string;

  @Column({ type: 'text', nullable: true })
  about: string | null = null;

  @Column({
    type: 'date',
    nullable: true,
  })
  birthDate: Date | null = null;

  @Column({ type: 'text', nullable: true })
  city: string | null = null;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({ type: 'text' })
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
  })
  @Exclude()
  refreshToken: string;

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
  wantToLearn?: Category[];
}
