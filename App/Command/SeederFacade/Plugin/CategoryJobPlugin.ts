import { SeederCommand } from "../../SeederCommand";
import { IPluginSeeder } from "../Interface";
import { IJob } from "App/Models/CategoryJobsModel";
import { ICategoryJob } from "App/Models/CategoryJobsModel";

export class CategoryJobPlugin implements IPluginSeeder {
    name: string = 'category-job';
    description: string = 'Seeder data for category job';
    async excute(context: SeederCommand) {
        if (await context._catJobModel.find().count())  context._catJobModel.dropCollection();

        const CatJobModel = context.mappingModel['category_jobs'];
        const JobModel = context.mappingModel['jobs'];
        const cats = await CatJobModel.find();
        const data: Array<object> = [];
        for (const cat of cats) {
            const arr: Array<object> = [];
            const jobs = await JobModel.find({ category_id: cat._id });

            for (const job of jobs) {
                arr.push(<IJob>{ name: job.name, _id: job._id, static_id: job.static_id });
            }

            data.push({
                name: cat.name,
                jobs: <IJob[]>arr
            });
        }
        const result = await context._catJobModel.insertMany(<ICategoryJob[]>data);
        console.log('\x1b[31m', `created category reason: ${result.length}`, '\x1b[0m');
    }
}