import { Injectable } from 'System/Injectable';
import { IRoute, IRouter } from 'System/Interface';
import { AttachmentController } from 'App/Modules/Attachment/Controllers/AttachmentController';
import { HTTP } from 'System/Enum/HTTP';
import { GuestMiddleware } from 'App/Modules/Attachment/Middleware/GuestMiddleware';

@Injectable
export class Router implements IRouter {
    readonly routes: IRoute[];
    constructor(
        private attachmentController: AttachmentController,
        // middleware
        private guestMiddleware: GuestMiddleware
    ) {
        this.routes = [
            {
                path: 'attachments',
                middleware: [ { class: this.guestMiddleware } ],
                group: [
                    {
                        path: '',
                        method: HTTP.Post,
                        handler: this.attachmentController.actionUploadAttachment
                    }
                ]
            }
        ];
    }
}
