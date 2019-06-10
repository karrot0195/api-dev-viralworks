import { Injectable } from 'System/Injectable';
import { ImageMIME } from 'System/Enum/MIME';
import * as path from 'path';
import { BadRequest } from 'System/Error/BadRequest';
import { FileStorage } from 'System/FileStorage';
import { NotFound } from 'System/Error/NotFound';

@Injectable
export class AttachmentService {
    constructor(private _storage: FileStorage) {}

    /* MAIN FUNC */
    public async uploadFileToTemp(attachment: any) {
        if (
            attachment &&
            attachment.path &&
            (await this._storage.checkUploadFileType(attachment.path, this._getTypeAttachmentAllow()))
        ) {
            return { tmp: path.basename(attachment.path) };
        }

        throw new BadRequest({ fields: { attachment: 'IMAGE_WRONG_TYPE' } });
    }

    public async uploadAttachmentFromTemp(fileName: string, path: string, name: string) {
        return this._storage.storeUploadFile(await this.getPathFileTmp(fileName), path, name);
    }

    public async checkFileExist(fileName: string): Promise<Boolean> {
        return this._storage.checkFileExist(fileName);
    }

    public async renderAttachment(path: string, name: string) {
        const filePath = await this._storage.getAbsoluteFilePath(path, name);
        if (!(await this._storage.checkFileExist(filePath))) throw new NotFound('ATTACHMENT_NOT_FOUND');
        return this._storage.renderFile(filePath);
    }

    /* PRIVATE FUNC */
    private _getTypeAttachmentAllow() {
        return ImageMIME;
    }

    private async getPathFileTmp(fileName: string) {
        const path = `tmp-upload/${fileName}`;
        if (!await this.checkFileExist(path)) throw new NotFound('ATTACHMENT_NOT_FOUND');
        return path;
    }
}
