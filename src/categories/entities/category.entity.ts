import { Skill } from '../../skills/entities/skill.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('category')
@Index(['name', 'parent'], { unique: true }) // Уникальность имени в рамках одного родителя
export class Category {
  @ApiProperty({
    description: 'Уникальный идентификатор категории',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Название категории',
    example: 'Программирование',
    maxLength: 100,
  })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  name: string;

  @ApiProperty({
    description: 'Родительская категория',
    type: () => Category,
    required: false,
  })
  @ManyToOne(() => Category, (category) => category.children, {
    onDelete: 'CASCADE', // при удалении родителя автоматически удаляются все дочерние категории
  })
  parent?: Category;

  @ApiProperty({
    description: 'Дочерние категории',
    type: () => [Category],
    required: false,
  })
  @OneToMany(() => Category, (category) => category.parent, {
    cascade: true, //автоматическое сохранение/обновление дочерних категорий при работе с родителем
    onDelete: 'CASCADE', //дублирует поведение удаления (можно опустить, так как уже есть в @ManyToOne)
  })
  children?: Category[];

  @ApiProperty({
    description: 'Навыки в этой категории',
    type: () => [Skill],
    required: false,
  })
  @OneToMany(() => Skill, (skill) => skill.category, {
    onDelete: 'SET NULL', //при удалении категории, у связанных навыков поле categoryId устанавливается в NULL (вместо удаления навыков)
  })
  skills?: Skill[];
}
