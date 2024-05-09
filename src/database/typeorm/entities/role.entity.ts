/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, Index, JoinTable, ManyToMany, PrimaryGeneratedColumn, Relation, RelationId } from 'typeorm';
import { PermissionEntity } from '~/database/typeorm/entities/permission.entity';
import { PositionEntity } from '~/database/typeorm/entities/position.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'roles' })
export class RoleEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Index('IDX_ROLE_NAME', { fulltext: true })
    @Column({ name: 'name', type: 'varchar', length: 255, nullable: false })
    name: string;

    @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
    description: string;

    /* RELATION */
    @ManyToMany(() => PermissionEntity, (permissions) => permissions.roles, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
        createForeignKeyConstraints: false,
    })
    @JoinTable({
        name: 'roles_permissions',
        joinColumn: { name: 'role_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
    })
    permissions: Relation<PermissionEntity>[];

    @RelationId((role: RoleEntity) => role.permissions)
    permissionIds: number[];

    @ManyToMany(() => PositionEntity, (positions) => positions.roles, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
        createForeignKeyConstraints: false,
    })
    @JoinTable({
        name: 'roles_positions',
        joinColumn: { name: 'role_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'position_id', referencedColumnName: 'id' },
    })
    positions: Relation<PositionEntity>[];
}
