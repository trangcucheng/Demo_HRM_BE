import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { NotificationDetailEntity } from '~/database/typeorm/entities/notificationDetail.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: 'notifications' })
export class NotificationEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'type', type: 'varchar', length: 255, nullable: true })
    type: string;

    @Column({ name: 'is_read', type: 'tinyint', default: 0, nullable: true })
    isRead: boolean;

    @Column({ name: 'receiver_id', type: 'int', unsigned: true, nullable: true })
    receiverId: number;

    @Column({ name: 'sender_id', type: 'int', unsigned: true, nullable: true })
    senderId: number;

    @Column({ name: 'link', type: 'text', nullable: true })
    link: string;

    @Column({ name: 'entity', type: 'varchar', length: 255, nullable: true })
    entity: string;

    @Column({ name: 'entity_id', type: 'int', unsigned: true, nullable: true })
    entityId: number;

    /* RELATIONS */
    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'receiver_id', referencedColumnName: 'id' })
    receiver: Relation<UserEntity>;

    @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'sender_id', referencedColumnName: 'id' })
    sender: Relation<UserEntity>;

    @OneToMany(() => NotificationDetailEntity, (entity) => entity.notification, { createForeignKeyConstraints: false })
    details: Relation<NotificationDetailEntity>[];
}
