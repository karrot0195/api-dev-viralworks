import { Request, Response, NextFunction } from 'express';

import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface/Controller';
import { DataType, FormatType } from 'System/Enum';
import * as RE from 'System/RegularExpression';
import { CronService } from '../Services/Cron';

@Injectable
export class CronController {
    constructor(private readonly _cronService: CronService) {}

    getCrons: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).json(await this._cronService.getCronStatus());
        },
        document: {
            tags: ['Cron Management'],
            security: true,
            summary: 'Get pre-defined cron jobs'
        }
    };

    updateCrons: IHandler = {
        method: async (req: Request, res: Response, next: NextFunction) => {
            return res.status(200).json(await this._cronService.cronCtl(req.params.slug, req.query.action));
        },
        validation: {
            path: {
                slug: {
                    type: DataType.String,
                    required: true
                }
            },
            query: {
                action: {
                    type: DataType.String,
                    required: true,
                    pattern: RE.checkString.source
                }
            }
        },
        document: {
            tags: ['Cron Management'],
            summary: 'Enable or disable cron',
            security: true
        }
    };
}
