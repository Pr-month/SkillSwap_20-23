import { v4 as uuidv4 } from 'uuid';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Gender, Role } from 'src/common/types';
import { Skill } from '../../skills/entities/skill.entity';
import { Category } from 'src/categories/entities/category.entity';

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
    type: 'int',
    nullable: true,
  })
  age: number | null = null;

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

  @ManyToMany(() => Skill, { eager: true })
  @JoinTable()
  favoriteSkills?: Skill[];

  @ManyToMany(() => Category, { eager: true })
  @JoinTable()
  wantToLearn?: Category[];
}
