import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { REPAIR_REQUEST_STATUS } from '~/common/enums/enum';
import { MediaEntity } from '~/database/typeorm/entities/media.entity';
import { RepairDetailEntity } from '~/database/typeorm/entities/repairDetail.entity';
import { RepairProgressEntity } from '~/database/typeorm/entities/repairProgress.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { VehicleEntity } from '~/database/typeorm/entities/vehicle.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'repair_requests' })
export class RepairRequestEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'vehicle_id', type: 'int', unsigned: true, nullable: true })
    vehicleId: number;

    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;

    @Column({ name: 'damage_level', type: 'varchar', length: 50, nullable: true })
    damageLevel: string;

    @Column({ name: 'repair_by_id', type: 'int', unsigned: true, nullable: true })
    repairById: number;

    @Column({ name: 'start_date', type: 'datetime', nullable: true })
    startDate: Date;

    @Column({ name: 'end_date', type: 'datetime', nullable: true })
    endDate: Date;

    @Column({ name: 'status', type: 'varchar', length: 50, nullable: true, default: REPAIR_REQUEST_STATUS.IN_PROGRESS })
    status: string;

    @Column({ name: 'created_by_id', type: 'int', unsigned: true, nullable: true })
    createdById: number;

    @Column({ name: 'customer_name', type: 'varchar', length: 255, nullable: true })
    customerName: string;

    @Column({ name: 'comment', type: 'text', nullable: true })
    comment: string;

    @Column({ name: 'current_approver_id', type: 'int', unsigned: true, nullable: true })
    currentApproverId: number;

    /* RELATIONS */
    @ManyToOne(() => VehicleEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'vehicle_id', referencedColumnName: 'id' })
    vehicle: Relation<VehicleEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'repair_by_id', referencedColumnName: 'id' })
    repairBy: Relation<UserEntity>;

    @OneToMany(() => RepairDetailEntity, (entity) => entity.repairRequest, { createForeignKeyConstraints: false })
    details: Relation<RepairDetailEntity>[];

    @OneToMany(() => RepairProgressEntity, (entity) => entity.repairRequest, { createForeignKeyConstraints: false })
    progresses: Relation<RepairProgressEntity>[];

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
    createdBy: Relation<UserEntity>;

    @ManyToMany(() => MediaEntity, { createForeignKeyConstraints: false })
    @JoinTable({
        name: 'repair_requests_images',
        joinColumn: { name: 'repair_request_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'image_id', referencedColumnName: 'id' },
    })
    images: Relation<MediaEntity>[];

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'current_approver_id', referencedColumnName: 'id' })
    currentApprover: Relation<UserEntity>;
}
