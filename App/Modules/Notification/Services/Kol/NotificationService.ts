import { Injectable } from 'System/Injectable';
import { KolNotificationModel } from 'App/Models/KolNotificationModel';

@Injectable
export class NotificationService {
    constructor(private kolNotificationModel: KolNotificationModel) {}
}