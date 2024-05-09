import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { MediaEntity } from '~/database/typeorm/entities/media.entity';
import { StocktakeDetailEntity } from '~/database/typeorm/entities/stocktakeDetail.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { WarehouseEntity } from '~/database/typeorm/entities/warehouse.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'stocktakes' })
export class StocktakeEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'warehouse_id', type: 'int', unsigned: true, nullable: true })
    warehouseId: number;

    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;

    @Column({ name: 'status', type: 'varchar', length: 50, nullable: true })
    status: string;

    @Column({ name: 'start_date', type: 'timestamp', nullable: true })
    startDate: Date;

    @Column({ name: 'end_date', type: 'timestamp', nullable: true })
    endDate: Date;

    @Column({ name: 'created_by_id', type: 'int', unsigned: true, nullable: true })
    createdById: number;

    @Column({ name: 'updated_by_id', type: 'int', unsigned: true, nullable: true })
    updatedById: number;

    @Column({ name: 'comment', type: 'text', nullable: true })
    comment: string;

    @Column({ name: 'current_approver_id', type: 'int', unsigned: true, nullable: true })
    currentApproverId: number;

    /* RELATIONS */
    @ManyToOne(() => WarehouseEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'warehouse_id', referencedColumnName: 'id' })
    warehouse: Relation<WarehouseEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
    createdBy: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'updated_by_id', referencedColumnName: 'id' })
    updatedBy: Relation<UserEntity>;

    @ManyToMany(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinTable({
        name: 'stocktakes_participants',
        joinColumn: { name: 'stocktake_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    participants: Relation<UserEntity>[];

    @OneToMany(() => StocktakeDetailEntity, (entity) => entity.stocktake, { createForeignKeyConstraints: false })
    details: Relation<StocktakeDetailEntity>[];

    @ManyToMany(() => MediaEntity, { createForeignKeyConstraints: false })
    @JoinTable({
        name: 'stocktakes_attachments',
        joinColumn: { name: 'stocktake_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'media_id', referencedColumnName: 'id' },
    })
    attachments: Relation<MediaEntity>[];

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'current_approver_id', referencedColumnName: 'id' })
    currentApprover: Relation<UserEntity>;
}
