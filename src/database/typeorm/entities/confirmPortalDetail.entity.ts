import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { UserEntity } from './user.entity';
import { ConfirmPortalEntity } from './confirmPortal.entity';

@Entity({ name: 'confirm_portal_detail' })
export class ConfirmPortalDetailEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'content', type: 'varchar', length: 255, nullable: true })
    content: string;

    @Column({ name: 'comment', type: 'varchar', length: 255, nullable: true })
    comment: string;

    @Column({ name: 'staff_id', type: 'int', unsigned: true, nullable: true })
    staffId: number;

    @Column({ name: 'vehicle', type: 'varchar', length: 255, nullable: true })
    vehicle: string;

    @Column({ name: 'confirm_portal_id', type: 'int', unsigned: true, nullable: true })
    confirmPortalId: number;

    /* RELATIONS */
    @ManyToOne(() => ConfirmPortalEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'confirm_portal_id', referencedColumnName: 'id' })
    confirmPortal: Relation<ConfirmPortalEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'staff_id', referencedColumnName: 'id' })
    staff: Relation<UserEntity>;
}
