import { Request, Response, NextFunction } from 'express';

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

        await this.deleteFile(filePath);

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

    async cleanMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
        if (req.files) {
            for (let key in req.files) {
                await this.deleteFile(req.files[key].path);
            }
            console.log('Uploaded files are clear. ' + req.originalUrl);
        }
        return next(err);
    }
    
    async checkFileExist(filePath: string) {
        return await fs.existsSync(filePath);
    }

    renderFile(filePath: string) {
        return fs.readFileSync(filePath);
    }

    copyFileSync( source, target ) {

        var targetFile = target;

        //if target is a directory a new file with the same name will be created
        if ( fs.existsSync( target ) ) {
            if ( fs.lstatSync( target ).isDirectory() ) {
                targetFile = path.join( target, path.basename( source ) );
            }
        }

        fs.writeFileSync(targetFile, fs.readFileSync(source));
    }

    copyFolderRecursiveSync( source, target ) {
        var files: Array<any> = [];
        //check if folder needs to be created or integrated
        var targetFolder = target;
        if ( !fs.existsSync( targetFolder ) ) {
            fs.mkdirSync( targetFolder );
        }

        //copy
        if ( fs.lstatSync( source ).isDirectory() ) {
            files = fs.readdirSync( source );
            files.forEach(  ( file ) => {
                var curSource = path.join( source, file );
                if ( fs.lstatSync( curSource ).isDirectory() ) {
                    this.copyFolderRecursiveSync( curSource, targetFolder );
                } else {
                    this.copyFileSync( curSource, targetFolder );
                }
            } );
        }
    }
}
