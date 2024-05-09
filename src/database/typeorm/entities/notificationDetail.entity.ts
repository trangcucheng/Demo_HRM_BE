import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { NotificationEntity } from '~/database/typeorm/entities/notification.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'notification_details' })
export class NotificationDetailEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'notification_id', type: 'int', unsigned: true, nullable: true })
    notificationId: number;

    @Column({ name: 'lang', type: 'varchar', length: 5, nullable: true })
    lang: string;

    @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
    title: string;

    @Column({ name: 'content', type: 'text', nullable: true })
    content: string;

    /* RELATIONS */
    @ManyToOne(() => NotificationEntity, (entity) => entity.details, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'notification_id', referencedColumnName: 'id' })
    notification: Relation<NotificationEntity>;
}
