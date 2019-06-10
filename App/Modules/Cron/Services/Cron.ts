import * as _ from 'lodash';
import { exec as run } from 'child_process';

import { Injectable } from 'System/Injectable';
import { Config } from 'System/Config';
import { crons } from '../Cron';
import { InternalError, NotFound, BadRequest } from 'System/Error';
import cronstrue from 'cronstrue';
import { isRunning, enableCron, disableCron } from 'System/Helpers/Cron';

@Injectable
export class CronService {
    constructor(private readonly _config: Config) {}

    async getCronStatus() {
        for (let slug in crons) {
            crons[slug].interval = cronstrue.toString(crons[slug].interval_crontab);
            crons[slug].is_loaded = await isRunning(slug, crons[slug].command, crons[slug].interval_crontab);
        }

        return crons;
    }

    async cronCtl(slug: string, action: string) {
        if (!crons[slug]) throw new NotFound('CRON_NOT_FOUND');

        switch (action) {
            case 'enable':
                return enableCron(slug, crons[slug].command, crons[slug].interval_crontab);
            case 'disable':
                return disableCron(slug, crons[slug].command, crons[slug].interval_crontab);
            default:
                throw new BadRequest({ fields: { action: 'CRON_ACTION_NOT_FOUND' } });
        }
    }
}
