import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { FoodVoucherEntity } from './foodVoucher.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'food_voucher_detail' })
export class FoodVoucherDetailEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'number_of_noodle', type: 'int', unsigned: true, nullable: true })
    numberOfNoodle: number;

    @Column({ name: 'number_of_egg', type: 'int', unsigned: true, nullable: true })
    numberOfEgg: number;

    @Column({ name: 'number_of_dry', type: 'int', unsigned: true, nullable: true })
    numberOfDry: number;

    @Column({ name: 'number_of_milk', type: 'int', unsigned: true, nullable: true })
    numberOfMilk: number;

    @Column({ name: 'days_issued', type: 'int', unsigned: true, nullable: true })
    daysIssued: number;

    @Column({ name: 'staff_id', type: 'int', unsigned: true, nullable: true })
    staffId: number;

    @Column({ name: 'food_voucher_id', type: 'int', unsigned: true, nullable: true })
    foodVoucherId: number;

    /* RELATIONS */
    @ManyToOne(() => FoodVoucherEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'food_voucher_id', referencedColumnName: 'id' })
    foodVoucher: Relation<FoodVoucherEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'staff_id', referencedColumnName: 'id' })
    staff: Relation<UserEntity>;
}
