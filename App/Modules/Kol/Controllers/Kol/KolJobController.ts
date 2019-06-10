import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface/Controller';
import { Request, Response } from 'express';
import { KolService } from 'App/Modules/Kol/Services/Kol/KolService';
import { DataType } from 'System/Enum/Swagger';
import * as RE from 'System/RegularExpression';

@Injectable
export class KolJobController {
    constructor(private _kolService: KolService) {}

    public actionGetJobRunning: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json(await this._kolService.getJobRunningList(req.auth.id));
        },
        validation: {
        },
        document: {
            tags: ['Kol Job Manager'],
            summary: 'Get list Job'
        }
    };

    public actionGetJobCompleted: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json(await this._kolService.getJobCompletedList(req.auth.id));
        },
        validation: {
        },
        document: {
            tags: ['Kol Job Manager'],
            summary: 'Get list Job'
        }
    };

    public actionGetInvite: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json(await this._kolService.getDetailJob(req.auth.id, req.params.id));
        },
        validation: {
            path: {
                id: {
                    type: DataType.String,
                    pattern: RE.checkMongoId.source
                }
            }
        },
        document: {
            tags: ['Kol Job Manager'],
            summary: 'Get Job'
        }
    }
}
