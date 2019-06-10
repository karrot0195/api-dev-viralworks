import { Injectable } from 'System/Injectable';
import { KolJobPostStatus } from 'App/Models/KolJobModel';
import { IKolJobState } from './Interfaces/IKolJobState';
import { KolJobLinkState } from './Classes/KolJobLinkState';
import { KolJobContentState } from './Classes/KolJobContentState';
import { InternalError, Forbidden } from 'System/Error';
import { MailService } from 'App/Modules/Admin/Services/MailService';
import { KolJob } from 'Database/Schema/KolJobSchema';
import { KolUser } from 'Database/Schema/KolUserSchema';
import { Job } from 'Database/Schema/JobSchema';
import { ClientSession } from 'mongodb';
import { Mongo } from 'System/Mongo';

enum Error {
    STATE_NOT_ALLOW = 'State not allow',
    CAUSER_FIELD_REQUIRED = 'Causer field is required',
    SUBJECT_FIELD_REQUIRED = 'Subject field is required'
}

class FactoryKolJobState {
    static createState(status: number): IKolJobState {
        switch (status) {
            case KolJobPostStatus.Raw:
                return new KolJobContentState();
            case KolJobPostStatus.Content:
                return new KolJobLinkState();
        }
        throw new Forbidden('STATE_NOT_ALLOW');
    }
}

@Injectable
export class KolJobStateContext {
    private state: IKolJobState;
    private causerId: string;
    public subject: KolJob;
    constructor(private _mailService: MailService, private _mongo: Mongo) {
        this.state = FactoryKolJobState.createState(KolJobPostStatus.Content);
    }

    accept() {
        this.checkConditionExcute();
        return this._mongo.transaction(async session => this.state.accept(this, session));
    }

    reject(reason: string) {
        this.checkConditionExcute();
        return this._mongo.transaction(async session => this.state.reject(this, reason, session));
    }

    public sendMail(action: string, session?: ClientSession) {
        const kol  = (<KolUser>this.subject.kol_id);
        const job  = (<Job>this.subject.job_id);

        return this._mailService.excuteSendMailKol(this.causerId, kol._id, this.state.getMailType(), {
            job_title: job.title,
            job_link: '#',
            action: action
        }, session);
    }

    /* PRIVATE FUNC */
    private checkConditionExcute() {
        if (!this.causerId) throw new InternalError('CAUSER_FIELD_NOT_FOUND');
        if (!this.subject) throw new InternalError('SUBJECT_FIELD_NOT_FOUND');
    }
    /**/

    /* GETTER - SETTER */
    setRequireOption(subject: any, causerId: string) {
        this.causerId = causerId;
        this.subject = subject;
    }

    applyCurrentOption() {
        this.checkConditionExcute();
        this.setStateByStatus(this.subject.post.status);
    }

    public setCauserId(authId: string) {
        this.causerId = authId;
    }

    public getCauserId() {
        return this.causerId;
    }

    public setSubject(subject: any) {
        this.subject = subject;
    }

    public getSubject() {
        return this.subject;
    }

    public setStateByStatus(status: number) {
        this.setState(FactoryKolJobState.createState(status));
    }

    public setState(state: IKolJobState) {
        this.state = state;
    }
    /**/
}
