import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { UserEntity } from './user.entity';
import { ShiftEntity } from './shift.entity';

@Entity({ name: 'user_shifts' })
export class UserShiftEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: true })
    userId: number;

    @Column({ name: 'shift_id', type: 'int', unsigned: true, nullable: true })
    shiftId: number;

    /* RELATION */
    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.userShifts, {
        nullable: false,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Relation<UserEntity>;

    @ManyToOne(() => ShiftEntity, (entity: ShiftEntity) => entity.userShifts, {
        nullable: false,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'shift_id', referencedColumnName: 'id' })
    shift: Relation<ShiftEntity>;
}
