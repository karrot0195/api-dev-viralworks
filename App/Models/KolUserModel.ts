import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { BaseModel, IHookFilterCondition } from 'System/BaseModel';
import { KolUser } from 'Database/Schema/KolUserSchema';

/* Kol User*/
export interface IKolUser {
    readonly email: string;
    readonly code: string;
    readonly password: string;
    readonly setting: object;
    readonly status: string;
    readonly facebook: object;
    readonly kol_info: object;
    readonly token: object;
    readonly verify: object;
    readonly summary_info: string;
    readonly product_tour: number;
    readonly rate: number;
    readonly income: number;
    readonly payment_info: object;
    readonly delivery_info: object;
    readonly job: object;
}

/**/
export const SearchField = ['email', 'facebook.name', 'facebook.entity_id', 'kol_info.mobile', 'summary_info'];
export enum KolInfoStatus {
    Raw = 0,
    Verified = 1,
    Rejected = 2
}

export enum KolSex {
    Male = 0,
    Female = 1,
    Other = -1
}

export enum KolMatrimony {
    Single = 0,
    Marred = 1,
    Other = -1
}

export enum KolChild {
    Zero = 0,
    One = 1,
    Two = 2,
    Three = 3,
    Other = -1
}

export enum KolStatus {
    Enable = 1,
    Disable = 0
}

export enum TokenStatus {
    Raw = 0,
    Accept = 1
}

export const SELECT_BASIC_DATA = [
    'email',
    'facebook.name',
    'facebook.entity_id',
    'facebook.analytic',
    'facebook.profile_link',
    'kol_info.phone',
    'kol_info.sex',
    'kol_info.matrimony',
    'kol_info.num_child',
    'kol_info.dob',
    'kol_info.job',
    'kol_info.share_story',
    'location',
    'evaluate.province'
];

@Injectable
export class KolUserModel extends BaseModel<IKolUser, KolUser> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'kol_user');
    }

    async findWithFilter(query: any, modelSearchField: Array<string>, hook?: IHookFilterCondition) {
        if (query.term) query.term = query.term.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        return super.findWithFilter(query, ['summary_info'], hook);
    }
}
