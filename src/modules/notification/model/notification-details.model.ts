// notificationDetail.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDetail extends Document {
    notification_id: number;
    lang: string;
    title: string;
    content: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}

const notificationDetailSchema: Schema = new Schema({
    notificationId: { type: Number, required: true },
    lang: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    deleted_at: { type: Date, default: null },
});

export default mongoose.model<INotificationDetail>('NotificationDetail', notificationDetailSchema);
