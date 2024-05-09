import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { UserEntity } from './user.entity';
import { TRAVEL_PAPER_STATUS } from '~/common/enums/enum';
import { TravelPaperDetailEntity } from './travelPaperDetail.entity';

@Entity({ name: 'travel_paper' })
export class TravelPaperEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'reason', type: 'varchar', length: 255, nullable: true })
    reason: string;

    @Column({ name: 'address', type: 'varchar', length: 255, nullable: true })
    address: string;

    @Column({ name: 'start_day', type: 'date', nullable: true })
    startDay: Date;

    @Column({ name: 'end_day', type: 'date', nullable: true })
    endDay: Date;

    @Column({ type: 'enum', enum: TRAVEL_PAPER_STATUS, default: TRAVEL_PAPER_STATUS.DRAFT })
    status: TRAVEL_PAPER_STATUS;

    @Column({ name: 'receiver_ids', type: 'varchar', length: 255, nullable: true })
    receiverIds: string;

    @Column({ name: 'created_by_id', type: 'int', unsigned: true, nullable: true })
    createdById: number;

    @Column({ name: 'updated_by_id', type: 'int', unsigned: true, nullable: true })
    updatedById: number;

    @Column({ name: 'current_approver_id', type: 'int', unsigned: true, nullable: true })
    currentApproverId: number;

    /* RELATIONS */
    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
    createdBy: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'updated_by_id', referencedColumnName: 'id' })
    updatedBy: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'current_approver_id', referencedColumnName: 'id' })
    currentApprover: Relation<UserEntity>;

    @OneToMany(() => TravelPaperDetailEntity, (entity) => entity.travelPaper, { createForeignKeyConstraints: false })
    detail: Relation<TravelPaperDetailEntity>[];
}
