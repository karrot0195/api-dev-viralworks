import { Injectable } from './Injectable';
import { Config } from './Config';
import * as fs from 'fs';
import * as path from 'path';
import fileType = require('file-type');

require('./Helpers/Log');

@Injectable
export class FileStorage {
    constructor(private readonly _config: Config) {}

    async checkUploadFileType(path: string, MIMEList: string[]) {
        const buffer = await fs.readFileSync(path);

        let type = fileType(buffer);

        if (type && MIMEList.indexOf(type.mime) >= 0) return true;

        return false;
    }

    async storeUploadFile(filePath: string, folder: string, filename: string) {
        let newDir = path.join(this._config.storage.dir, folder);
        let newFilename = path.join(newDir, filename);

        if (!(await fs.existsSync(newDir))) await fs.mkdirSync(newDir);

        await fs.renameSync(filePath, newFilename);

        return { message: 'Upload successfully' };
    }

    async getAbsoluteFilePath(folder: string, filename: string) {
        let tmp = path.join(__dirname, '..', this._config.storage.dir, folder, filename);
        
        if (await fs.existsSync(tmp)) return tmp;
        
        return '';
    }

    async deleteFile(filePath: string) {
        if (await fs.existsSync(filePath)) await fs.unlinkSync(filePath);
    }
}
