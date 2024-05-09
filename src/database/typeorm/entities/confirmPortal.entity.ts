import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { UserEntity } from './user.entity';
import { CONFIRM_PORTAL_STATUS } from '~/common/enums/enum';
import { ConfirmPortalDetailEntity } from './confirmPortalDetail.entity';

@Entity({ name: 'confirm_portal' })
export class ConfirmPortalEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ type: 'enum', enum: CONFIRM_PORTAL_STATUS, default: CONFIRM_PORTAL_STATUS.DRAFT })
    status: CONFIRM_PORTAL_STATUS;

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

    @OneToMany(() => ConfirmPortalDetailEntity, (entity) => entity.confirmPortal, { createForeignKeyConstraints: false })
    detail: Relation<ConfirmPortalDetailEntity>[];

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'current_approver_id', referencedColumnName: 'id' })
    currentApprover: Relation<UserEntity>;
}
