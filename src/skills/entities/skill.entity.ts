import { v4 as uuidv4 } from 'uuid';
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { Request } from '../../requests/entities/request.entity';

@Entity('skill')
export class Skill {
  @PrimaryColumn({ type: 'uuid' })
  id: string = uuidv4();

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column('text', { array: true, nullable: true })
  images: string[];

  @ManyToOne(() => User, (user) => user.skills, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  // Добавляем связи с заявками
  @OneToMany(() => Request, (request) => request.offeredSkill)
  offeredInRequests?: Request[];

  @OneToMany(() => Request, (request) => request.requestedSkill)
  requestedInRequests?: Request[];

  @ManyToOne(() => Category, (category) => category.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}
