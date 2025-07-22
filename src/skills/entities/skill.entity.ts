import { User } from '../../users/entities/user.entity';
import { Column, Entity, ManyToMany, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('skill')
export class Skill {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

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

  @Column({ type: 'text' })
  images: string[];

  @ManyToOne(() => User, (user) => user.skills)
  owner: User;

  @ManyToMany(() => User, (user) => user.favoriteSkills, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  enjoyers?: User[];

  // @ManyToOne(() => Category, (category) => category.id)
  // category: Category
}
