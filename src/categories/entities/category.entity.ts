import { Skill } from '../../skills/entities/skill.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  name: string;

  @ManyToOne(() => Category, (category) => category.children, {
    onDelete: 'CASCADE', // при удалении родителя автоматически удаляются все дочерние категории
  })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent, {
    cascade: true, //автоматическое сохранение/обновление дочерних категорий при работе с родителем
    onDelete: 'CASCADE', //дублирует поведение удаления (можно опустить, так как уже есть в @ManyToOne)
  })
  children?: Category[];

  @OneToMany(() => Skill, (skill) => skill.category, {
    onDelete: 'SET NULL', //при удалении категории, у связанных навыков поле categoryId устанавливается в NULL (вместо удаления навыков)
  })
  skills?: Skill[];
}
