import { Injectable } from 'System/Injectable';
import { BaseModel } from 'System/BaseModel';
import { Notification } from 'Database/Schema/KolNotificationSchema';
import { Mongo } from 'System/Mongo';

export interface INotification {
    readonly receiver_id: string;
    readonly sender_id: string;
    readonly message: string;
    readonly type: string;
    readonly other: object;
    readonly source: string;
}

@Injectable
export class KolNotificationModel extends BaseModel<INotification, Notification> {
    constructor(mongo: Mongo) {
        super(mongo, 'admin_notification');
    }
}