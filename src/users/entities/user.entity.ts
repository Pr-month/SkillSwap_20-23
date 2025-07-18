import { Column, Entity, PrimaryColumn } from "typeorm";
import { Gender, Role } from "src/common/types";

@Entity()
export class User {
    @PrimaryColumn({ type: 'uuid' })
    id: string;
    @Column({type: 'text'})
    name: string;
    @Column({ type: 'text'})
    email: string;
    @Column({ type: 'text' })
    password: string;
    @Column({ type: 'int' })
    age: number;
    @Column({type: 'text'})
    city: string;
    @Column({
        type: 'enum',
        enum: ['male', 'female'],
    })
    gender: Gender;
    @Column({type: 'text'})
    avatar: string;
    @Column({
        type: 'enum',
        enum: ['ADMIN', 'USER']
    })
    role: Role;
    @Column({
        type: 'varchar',
        length: 255,
        unique: true
    })
    refreshToken: string
    // @OneToMany(() => Skill, (skill) => skill.id)
    // skills: Skill
    // @OneToMany(() => Skill, (skill) => skill.id)
    // wantToLearn: Skill
    // @OneToMany(() => Skill, (skill) => skill.id)
    // favoriteSkills: Skill
}
