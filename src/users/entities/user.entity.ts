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

@Entity('user')
export class User {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

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

  @ManyToMany(() => Skill, (skill) => skill.enjoyers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinTable({
    name: 'user_skill',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'skill_id',
      referencedColumnName: 'id',
    },
  })
  favoriteSkills?: Skill[];

  // @OneToMany(() => Category, (category) => Category.value)
  // wantToLearn: Category[];
}
