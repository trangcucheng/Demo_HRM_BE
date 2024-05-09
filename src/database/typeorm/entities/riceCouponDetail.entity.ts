import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { RiceCouponEntity } from './riceCoupon.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'rice_coupon_detail' })
export class RiceCouponDetailEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'number_of_breakfast', type: 'int', unsigned: true, nullable: true })
    numberOfBreakfast: number;

    @Column({ name: 'number_of_lunches', type: 'int', unsigned: true, nullable: true })
    numberOfLunches: number;

    @Column({ name: 'number_of_dinners', type: 'int', unsigned: true, nullable: true })
    numberOfDinners: number;

    @Column({ name: 'days_issued', type: 'int', unsigned: true, nullable: true })
    daysIssued: number;

    @Column({ name: 'staff_id', type: 'int', unsigned: true, nullable: true })
    staffId: number;

    @Column({ name: 'rice_coupon_id', type: 'int', unsigned: true, nullable: true })
    riceCouponId: number;

    /* RELATIONS */
    @ManyToOne(() => RiceCouponEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'rice_coupon_id', referencedColumnName: 'id' })
    riceCoupon: Relation<RiceCouponEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'staff_id', referencedColumnName: 'id' })
    staff: Relation<UserEntity>;
}
