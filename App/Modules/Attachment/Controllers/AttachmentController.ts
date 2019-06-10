import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface/Controller';
import { Request, Response } from 'express';
import { DataType } from 'System/Enum/Swagger';
import { BadRequest } from 'System/Error/BadRequest';
import { AttachmentService } from 'App/Modules/Attachment/Services/AttachmentService';

@Injectable
export class AttachmentController {
    constructor(private attachmentService: AttachmentService) {}
    public actionUploadAttachment: IHandler = {
        method: async (req: Request, res: Response) => {
            if (!req.files || !req.files.attachment)
                throw new BadRequest({ fields: { attachment: 'FIELD_ATTACHMENT_REQUIRED' } });
            const result = await this.attachmentService.uploadFileToTemp(req.files.attachment);
            res.json(result);
        },
        validation: {
            formData: {
                attachment: {
                    type: DataType.File
                }
            }
        },
        document: {
            tags: ['Attachment Manager'],
            summary: 'Upload attachment to temporary',
            responses: {
                200: 'Successfully'
            }
        }
    };
}
