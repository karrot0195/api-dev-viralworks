import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';

import { Injectable } from 'System/Injectable';
import { ICommand } from 'System/Interface';
import { Config } from 'System/Config';

@Injectable
export class CleanTmpFiles implements ICommand {
    constructor(private readonly _config: Config) {}

    public async run() {
        let tmpPath = this._config.storage.tmp;

        let files = _.without(await fs.readdirSync(tmpPath), '.gitignore');

        console.log('Found', files.length, 'files');

        let currentMs = new Date().getTime();

        for await (let file of files) {
            let filePath = path.join(tmpPath, file);

            let fileStat = await fs.statSync(filePath);

            let existedMinute = (currentMs - fileStat.birthtimeMs) / 60000;

            console.log('File', file, 'is existed for', existedMinute, 'minute(s)');

            if (existedMinute > 15) {
                await fs.unlinkSync(filePath);
                console.log('Removed:', file);
            }
        }

        return 'Done cleaning tmp files.';
    }
}
