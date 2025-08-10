import { User } from '../../users/entities/user.entity';
import { Skill } from '../../skills/entities/skill.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReqStatus } from '../../common/requests-status.enum';

@Entity('request')
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => User)
  @JoinColumn()
  sender: User;

  @OneToOne(() => User)
  @JoinColumn()
  receiver: User;

  @Column({
    type: 'enum',
    enum: ReqStatus,
    default: ReqStatus.PENDING,
  })
  status: ReqStatus;

  @OneToOne(() => Skill)
  @JoinColumn()
  offeredSkill: Skill;

  @OneToOne(() => Skill)
  @JoinColumn()
  requestedSkill: Skill;

  @Column()
  isRead: boolean;
}
