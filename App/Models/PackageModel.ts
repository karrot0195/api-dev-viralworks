import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { BaseModel, IHookFilterCondition } from 'System/BaseModel';
import { Package } from 'Database/Schema/PackageSchema';

export interface IPackage {
    readonly name: string;
    readonly description: string;
    readonly package_price: number;
    readonly post_type: string;
    readonly occupations: any[];
    readonly topics: any[];
    readonly male_percent: string;
    readonly location: string;
    readonly age_average: string;
    groups: IGroup[];
    tmp_cover: string;
    cover_url: string;
    readonly is_public: boolean;
    readonly show_dashboard: boolean;
    readonly is_instant: boolean;
    slug: string;
    readonly display_stats: {
        total_post: number;
        total_follower: number;
        total_average_engagement: number;
        location: string;
    };
}

export interface IGroup {
    price?: number;
    tag: number;
    kols?: string[];
}

@Injectable
export class PackageModel extends BaseModel<IPackage, Package> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'kol_package');
    }
}
