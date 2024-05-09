import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { RoleEntity } from '~/database/typeorm/entities/role.entity';
import { AbstractEntity } from './abstract.entity';
import { ContractEntity } from './contract.entity';
import { PositionGroupEntity } from './positionGroup.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'positions' })
export class PositionEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ name: 'code', type: 'varchar', length: 50, nullable: true })
    code: string;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
    description: string;

    @Column({ name: 'position_group_id', type: 'int', unsigned: true, nullable: true })
    positionGroupId: number;

    @Column({ name: 'level', type: 'smallint', unsigned: true, nullable: true, default: 0 })
    level: number;

    /* RELATION */
    @OneToMany(() => ContractEntity, (entity: ContractEntity) => entity.position, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    contracts: Relation<ContractEntity>[];

    @OneToMany(() => UserEntity, (entity: UserEntity) => entity.position, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    users: Relation<UserEntity>[];

    @ManyToOne(() => PositionGroupEntity, (entity: PositionGroupEntity) => entity.positions, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'position_group_id', referencedColumnName: 'id' })
    positionGroup: Relation<PositionGroupEntity>[];

    @ManyToMany(() => RoleEntity, (roles) => roles.positions, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
        createForeignKeyConstraints: false,
    })
    @JoinTable({
        name: 'roles_positions',
        joinColumn: { name: 'position_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    })
    roles: Relation<RoleEntity>[];
}
