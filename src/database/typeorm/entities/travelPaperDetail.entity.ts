import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { TravelPaperEntity } from './travelPaper.entity';

@Entity({ name: 'travel_paper_detail' })
export class TravelPaperDetailEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'departure', type: 'varchar', length: 255, nullable: true })
    departure: string;

    @Column({ name: 'destination', type: 'varchar', length: 255, nullable: true })
    destination: string;

    @Column({ name: 'start_day', type: 'date', nullable: true })
    startDay: Date;

    @Column({ name: 'end_day', type: 'date', nullable: true })
    endDay: Date;

    @Column({ name: 'vehicle', type: 'varchar', length: 255, nullable: true })
    vehicle: string;

    @Column({ name: 'travel_paper_id', type: 'int', unsigned: true, nullable: true })
    travelPaperId: number;

    /* RELATIONS */
    @ManyToOne(() => TravelPaperEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'travel_paper_id', referencedColumnName: 'id' })
    travelPaper: Relation<TravelPaperEntity>;
}
