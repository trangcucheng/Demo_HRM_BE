// notification.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    type: string;
    isRead: boolean;
    receiverId: number;
    senderId: number;
    link: string;
    entity: string;
    entityId: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

const notificationSchema: Schema = new Schema({
    type: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    receiverId: { type: Number, required: true },
    senderId: { type: Number, required: true },
    link: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
});

export default mongoose.model<INotification>('Notification', notificationSchema);
