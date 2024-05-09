import { Column, Entity, Index, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from '~/database/typeorm/entities/abstract.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';

@Entity({ name: 'accounts' })
export class AccountEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Index('IDX_ACCOUNT_USERNAME', { fulltext: true })
    @Column({ name: 'username', type: 'varchar', length: 255 })
    username: string;

    @Column({ name: 'password', type: 'varchar', length: 255, nullable: true })
    password: string;

    @Column({ name: 'salt', type: 'varchar', length: 255, nullable: true })
    salt: string;

    @Column({ name: 'secret_token', type: 'varchar', length: 255, nullable: true })
    secretToken: string;

    @Column({ name: 'is_active', type: 'boolean', default: true, nullable: true })
    isActive: boolean;

    /* RELATIONS */
    @OneToOne(() => UserEntity, (user) => user.account, { createForeignKeyConstraints: false })
    user: Relation<UserEntity>;
}
