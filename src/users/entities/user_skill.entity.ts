import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Skill } from 'src/skills/entities/skill.entity';

@Entity('user_skill')
export class UserSkill {
  @PrimaryColumn({ name: 'user_id' })
  studentId: number;

  @PrimaryColumn({ name: 'skill_id' })
  courseId: number;

  @ManyToOne(() => User, (user) => user.favoriteSkills, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  enjoyers: User[];

  @ManyToOne(() => Skill, (skill) => skill.enjoyers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'skill_id', referencedColumnName: 'id' }])
  favouriteSkills: Skill[];
}
