import { KolJobStateContext } from '../KolJobStateContext';
import { ClientSession } from 'mongodb';

export interface IKolJobState {
    accept(context: KolJobStateContext, session?: ClientSession);
    reject(context: KolJobStateContext, reason: string, session?: ClientSession);
    getMailType(): number;
}
