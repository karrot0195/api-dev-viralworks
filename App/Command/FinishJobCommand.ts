import {ICommand} from "System/Interface/Command";
import {Injectable} from "System/Injectable";
import {Mongo} from "System/Mongo";
import { JobModel, JobStatus } from 'App/Models/JobModel';
import { JobHistoryAction } from 'Database/Schema/JobSchema';
import { UserModel } from 'App/Models/UserModel';
import { NotFound } from 'System/Error/NotFound';

@Injectable
export class FinishJobCommand implements ICommand {
    constructor(private _mongo: Mongo, private _jobModel: JobModel, private userModel: UserModel) {
    }

    run = async () => {
        return this.excute();
    };

    public async excute() {
        const emailSuper = 'super_admin@admin.com';
        const auth = await this.userModel.findOne({ email: emailSuper });
        if (!auth) throw new NotFound('USER_NOT_FOUND');
        // get list job over deadline
        const jobs = await this._jobModel.find({
            $where: "this.time[this.time.length - 1].time <= new Date()",
            status: JobStatus.Running
        });
        const jobClosed: Array<any> = [];
        if (jobs) {
            for (const job of jobs) {
                job.status = JobStatus.Finish;
                if (!job.histories) job.histories = [];
                job.histories.push({
                    job_status: job.status,
                    type: JobHistoryAction.FinishJob,
                    causer_id: auth._id,
                    time: new Date()
                });
                jobClosed.push(await job.save());
            }
        }
        return jobClosed;
    }
}