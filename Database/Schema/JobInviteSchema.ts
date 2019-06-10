import * as mongoose from 'mongoose';
import { IDocument } from 'System/Interface';
import { KolUser } from './KolUserSchema';
import { Job } from './JobSchema';

const schema = mongoose.Schema;
export interface JobInvite extends IDocument {
    kol_id: string|KolUser;
    job_id: string|Job;
    price: number,
    status: number;
    histories: Array<any>
}

export enum CauserFrom {
    Admin = 'user',
    Kol = 'kol'
}

export const JobInviteSchema = {
    kol_id: {
        type: schema.Types.ObjectId,
        ref: 'kol_user'
    },
    job_id: {
        type: schema.Types.ObjectId,
        ref: 'job'
    },
    price: {
        type: schema.Types.Number,
        require: true
    },
    status: {
        type: Number,
        default: 1 // Raw status
    },
    histories: [
        {
            time: {
                type: Date,
                default: new Date()
            },
            current_status: {
                type: Number
            },
            status: {
                type: Number
            },
            causer_id: {
                type: schema.Types.ObjectId,
                ref: 'user'
            },
            reason: {
                type: String
            }
        }
    ]

};
