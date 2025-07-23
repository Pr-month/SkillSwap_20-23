import { v4 as uuidv4 } from 'uuid';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Gender, Role } from 'src/common/types';
import { Skill } from '../../skills/entities/skill.entity';
import { Category } from 'src/categories/entities/category.entity';

@Entity('user')
export class User {
  @PrimaryColumn({ type: 'uuid' })
  id: string = uuidv4();

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ type: 'text' })
  about: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'text' })
  city: string;

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
  refreshToken: string;

  @OneToMany(() => Skill, (skill) => skill.owner, {
    cascade: true,
  })
  skills?: Skill[];

  @ManyToMany(() => Skill, { eager: true })
  @JoinTable()
  favoriteSkills?: Skill[];

  @ManyToMany(() => Category, { eager: true })
  @JoinTable()
  wantToLearn?: Category[];
}
