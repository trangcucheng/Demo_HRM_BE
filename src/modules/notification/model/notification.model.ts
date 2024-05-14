import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema()
export class Notification {

    @Prop({ required: true })
    type: string;

    @Prop({ default: false })
    isRead: boolean;

    @Prop({ required: true })
    receiverId: number;

    @Prop({ required: true })
    senderId: number;

    @Prop({ required: true })
    link: string;

    @Prop({ required: true })
    entity: string;

    @Prop({ required: true })
    entityId: number;

    @Prop({ type: [{ lang: String, title: String, content: String }] })
    details: { lang: string; title: string; content: string }[];

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: Date.now })
    updatedAt: Date;

    @Prop()
    deletedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
