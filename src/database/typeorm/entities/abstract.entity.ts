import { BaseEntity, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';
import { IEntityInterface } from '~/common/models';

export abstract class AbstractEntity extends BaseEntity implements IEntityInterface {
    //   @Generated('uuid')
    //   system_id: string;

    @CreateDateColumn({
        select: true,
        type: 'timestamp',
        name: 'created_at',
    })
    createdAt: Date;

    @UpdateDateColumn({
        select: false,
        type: 'timestamp',
        name: 'updated_at',
        nullable: true,
    })
    updatedAt: Date;

    @DeleteDateColumn({
        select: false,
        type: 'timestamp',
        name: 'deleted_at',
        nullable: true,
    })
    deleteAt: Date;
}
