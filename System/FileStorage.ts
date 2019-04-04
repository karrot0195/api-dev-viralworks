import { Injectable } from './Injectable';
import { Config } from './Config';
import * as fs from 'fs';
import * as path from 'path';
import fileType = require('file-type');

require('./Helpers/Log');

@Injectable
export class FileStorage {
    constructor(private readonly _config: Config) {}

    async setup() {
        console.log('Configuring file storage...');

        for (let directory in this._config.storage) {
            let tmp = this._config.storage[directory];
            if (!(await fs.existsSync(tmp))) await fs.mkdirSync(tmp);
        }

        console.log('Configuring file storage - DONE');
    }

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

        return { message: 'Upload successfully'}
    }

    async deleteFile(filePath: string){
        if (await fs.existsSync(filePath)) await fs.unlinkSync(filePath)
    }
}
