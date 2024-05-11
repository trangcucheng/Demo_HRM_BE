// notificationDetail.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDetail extends Document {
    notificationId: number;
    lang: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

const notificationDetailSchema: Schema = new Schema({
    notificationId: { type: Number, required: true },
    lang: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
});

export default mongoose.model<INotificationDetail>('NotificationDetail', notificationDetailSchema);
