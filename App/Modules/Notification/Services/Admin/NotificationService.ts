import { Injectable } from 'System/Injectable';
import { AdminNotificationModel } from 'App/Models/AdminNotificationModel';

@Injectable
export class NotificationService {
    constructor(private adminNotificationService: AdminNotificationModel) {}
}