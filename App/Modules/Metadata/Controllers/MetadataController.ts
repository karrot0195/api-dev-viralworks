import { Request, Response } from 'express';

import { Injectable } from 'System/Injectable';
import { MetadataService } from '../Services/MetadataService';
import { IHandler } from 'System/Interface/Controller';
import { TagColor } from '../Enum/TagColor';

@Injectable
export class MetadataController {
    constructor(private readonly service: MetadataService) {}

    public readonly getCategoryJobs: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).json(await this.service.findAllCategoryJob());
        },
        document: {
            tags: ['Metadata Manager'],
            security: true,
            summary: 'Get all occupations'
        }
    };

    public readonly getShareStories: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).json(await this.service.findAllShareStory());
        },
        document: {
            tags: ['Metadata Manager'],
            security: true,
            summary: 'Get all topics'
        }
    };

    public readonly getTagColors: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).json(TagColor);
        },
        document: {
            tags: ['Metadata Manager'],
            security: true,
            summary: 'Get all tag colors of public package'
        }
    };

    public readonly actionGetProvinces: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).json(await this.service.findAllProvince());
        },
        document: {
            tags: ['Metadata Manager'],
            security: true,
            summary: 'Get all province data'
        }
    };

    public readonly actionSuggestPrices: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).json(await this.service.findAllSuggestPrice());
        },
        document: {
            tags: ['Metadata Manager'],
            security: true,
            summary: 'Get all province data'
        }
    };

    public readonly actionGetKolFaqs: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).json(await this.service.findKolFaqs());
        },
        document: {
            tags: ['Metadata Manager'],
            security: true,
            summary: 'Get all kol faq'
        }
    };

    public readonly actionGetBanks: IHandler = {
        method: async (req: Request, res: Response) => {
            return res.status(200).json(await this.service.findBanks());
        },
        document: {
            tags: ['Metadata Manager'],
            security: true,
            summary: 'Get all bank'
        }
    };

}
