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
import { ApiProperty } from '@nestjs/swagger';

@Entity('request')
export class Request {
  @ApiProperty({
    description: 'Уникальный идентификатор запроса',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
    format: 'uuid'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Дата создания запроса',
    format: 'date-time',
    example: '2023-10-05T14:48:00Z',
    readOnly: true
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Пользователь, отправивший запрос',
    type: () => User,
    example: {
      id: '123',
      name: 'John Doe'
    }
  })
  @OneToOne(() => User)
  @JoinColumn()
  sender: User;

  @ApiProperty({
    description: 'Пользователь, получающий запрос',
    type: () => User,
    example: {
      id: '456',
      name: 'Jane Smith'
    }
  })
  @OneToOne(() => User)
  @JoinColumn()
  receiver: User;

  @ApiProperty({
    description: 'Статус запроса',
    enum: ReqStatus,
    example: ReqStatus.PENDING,
    default: ReqStatus.PENDING
  })
  @Column({
    type: 'enum',
    enum: ReqStatus,
    default: ReqStatus.PENDING,
  })
  status: ReqStatus;

  @ApiProperty({
    description: 'Навык, который предлагается в обмен',
    type: () => Skill,
    example: {
      id: '789',
      name: 'Web Development'
    }
  })
  @OneToOne(() => Skill)
  @JoinColumn()
  offeredSkill: Skill;

  @ApiProperty({
    description: 'Навык, который запрашивается',
    type: () => Skill,
    example: {
      id: '012',
      name: 'Graphic Design'
    }
  })
  @OneToOne(() => Skill)
  @JoinColumn()
  requestedSkill: Skill;

  @ApiProperty({
    description: 'Флаг прочтения запроса',
    example: false,
    default: false
  })
  @Column()
  isRead: boolean;
}
