/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, Index, JoinTable, ManyToMany, PrimaryGeneratedColumn, Relation, RelationId } from 'typeorm';
import { RoleEntity } from '~/database/typeorm/entities/role.entity';
import { AbstractEntity } from './abstract.entity';

@Index('UQ_permissions_name_action', ['name', 'action'], { unique: true })
@Entity({ name: 'permissions' })
export class PermissionEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Index('IDX_PERMISSION_NAME', { fulltext: true })
    @Column({ name: 'name', type: 'varchar', length: 255, nullable: false })
    name: string;

    @Column({ name: 'type', type: 'varchar', length: 255, nullable: true })
    type: string;

    @Column({ name: 'action', type: 'varchar', length: 255, nullable: false })
    action: string;

    /* RELATION */
    @ManyToMany(() => RoleEntity, (roles) => roles.permissions, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
        createForeignKeyConstraints: false,
    })
    @JoinTable({
        name: 'roles_permissions',
        joinColumn: { name: 'permission_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    })
    roles: Relation<RoleEntity>[];

    @RelationId((permission: PermissionEntity) => permission.roles)
    roleIds: number[];
}
