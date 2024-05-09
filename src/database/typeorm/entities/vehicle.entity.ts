import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'vehicle' })
export class VehicleEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
    name: string;

    @Index('IDX_VEHICLE_REGISTRATION', { fulltext: true })
    @Column({ name: 'registration_number', type: 'varchar', length: 255, nullable: true })
    registrationNumber: string;

    @Column({ name: 'chassis_number', type: 'varchar', length: 255, nullable: true })
    chassisNumber: string;

    @Column({ name: 'engine_number', type: 'varchar', length: 255, nullable: true })
    engineNumber: string;

    @Column({ name: 'model', type: 'varchar', length: 255, nullable: true })
    model: string;

    @Column({ name: 'status', type: 'varchar', length: 50, nullable: true })
    status: string;

    @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: true })
    userId: number;

    /* RELATIONS */
    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Relation<UserEntity>;
}
