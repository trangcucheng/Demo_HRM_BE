// notification.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    type: string;
    is_read: boolean;
    receiver_id: number;
    sender_id: number;
    link: string;
    entity: string;
    entity_id: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}

const notificationSchema: Schema = new Schema({
    type: { type: String, required: true },
    is_read: { type: Boolean, default: false },
    receiver_id: { type: Number, required: true },
    sender_id: { type: Number, required: true },
    link: { type: String, required: true },
    entity: { type: String, required: true },
    entity_id: { type: Number, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    deleted_at: { type: Date, default: null },
});

export default mongoose.model<INotification>('Notification', notificationSchema);
