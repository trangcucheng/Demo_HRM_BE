import { IS_MANAGER } from './../../../common/enums/enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { PositionEntity } from './position.entity';

@Entity({ name: 'position_group' })
export class PositionGroupEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ name: 'is_manager', type: 'int', unsigned: true, default: 1 })
    isManager: number;

    @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
    description: string;

    /* RELATION */
    @OneToMany(() => PositionEntity, (entity: PositionEntity) => entity.positionGroup, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    positions: Relation<PositionEntity>[];
}
