import { Gender } from "src/common/types";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Auth {
    @PrimaryColumn({ type: 'uuid' })
    id: string;

    @Column({ type: 'text' })
    email: string;

    @Column({ type: 'text' })
    password: string;

    @Column({ type: 'text' })
    name: string;

    @Column({ type: 'date' })
    date: string

    @Column({ type: 'text' })
    city: string

    @Column({
        type: 'enum',
        enum: ['male', 'female']
    })
    gender: Gender
}
