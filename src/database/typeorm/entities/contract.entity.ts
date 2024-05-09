import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { CONTRACT_RESULT, CONTRACT_STATUS, CONTRACT_TYPE } from '~/common/enums/enum';
import { AbstractEntity } from './abstract.entity';
import { PositionEntity } from './position.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'contracts' })
export class ContractEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
    description: string;

    @Column({ name: 'contract_type', type: 'enum', enum: CONTRACT_TYPE, nullable: true })
    contractType: CONTRACT_TYPE;

    @Column({ name: 'signing_day', type: 'date', nullable: true })
    signingDay: Date;

    @Column({ name: 'start_day', type: 'date', nullable: true })
    startDay: Date;

    @Column({ name: 'end_day', type: 'date', nullable: true })
    endDay: Date;

    @Column({ type: 'enum', enum: CONTRACT_STATUS, default: CONTRACT_STATUS.ACTIVE })
    status: CONTRACT_STATUS;

    @Column({ name: 'result', type: 'enum', enum: CONTRACT_RESULT, nullable: true })
    result: CONTRACT_RESULT;

    @Column({ name: 'termination_day', type: 'date', nullable: true })
    terminationDay: Date;

    @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: true })
    userId: number;

    @Column({ name: 'salary', type: 'varchar', length: 255, nullable: true })
    salary: string;

    @Column({ name: 'position_id', type: 'int', unsigned: true, nullable: true })
    positionId: number;

    /* RELATION */
    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.contracts, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Relation<UserEntity>;

    @ManyToOne(() => PositionEntity, (entity: PositionEntity) => entity.contracts, {
        nullable: true,
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'position_id', referencedColumnName: 'id' })
    position: Relation<PositionEntity>;
}
