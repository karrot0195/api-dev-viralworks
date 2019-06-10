import { Injectable } from 'System/Injectable';
import { IHandler } from 'System/Interface/Controller';
import { Request, Response } from 'express';
import { Forbidden } from 'System/Error';
import { DataType } from 'System/Enum';
import { SocialLiteService } from '../Services/SocialLiteService';

@Injectable
export class SocialController {
    constructor(private socialLiteService: SocialLiteService) {}

    public readonly authenticateFacebook: IHandler = {
        method: async (req: Request, res: Response) => {
            res.json(await this.socialLiteService.getUserInfoByCode(req.body.code));
        },
        document: {
            summary: 'Authentication Facebook kol',
            responses: {
                200: 'Successfully'
            },
            security: false,
            tags: ['Social Manager']
        },
        validation: {
            body: {
                type: DataType.Object,
                properties: {
                    code: {
                        type: DataType.String,
                        required: true
                    }
                }
            }
        }
    };

    public readonly facebookCallback: IHandler = {
        method: async (req: Request, res: Response) => {
            const userAgent = req.headers['user-agent'];
            if (!userAgent) throw new Forbidden('USER_AGENT_REQUIRED');

            if (req.query.code) {
                const result = await this.socialLiteService.getUserInfoByCode(req.query.code, userAgent);
                const redirectUrl = `${result['redirect_url']}?token=${result['token']}&email=${
                    result['data']['email']
                }&name=${result['data']['name']}`;
                return res.redirect(redirectUrl);
            }
            throw new Forbidden('ERROR_CALLBACK_FB');
        },
        document: {
            summary: 'Callback API FB',
            responses: {
                200: 'Successfully'
            },
            security: false,
            tags: ['Social Manager']
        }
    };
}
