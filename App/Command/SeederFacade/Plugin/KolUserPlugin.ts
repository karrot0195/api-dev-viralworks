import { SeederCommand } from '../../SeederCommand';
import { IKolUser, KolInfoStatus } from 'App/Models/KolUserModel';
import { isString } from 'util';
import { IPluginSeeder } from '../Interface';

export class KolUserPlugin implements IPluginSeeder {
    public name: string = 'kol-user';
    public description: string = 'Seeder data for kol user';

    async excute(context: SeederCommand) {
        if (await context._kolUserModel.find().count())  context._kolUserModel.dropCollection();
        const KolUserModel = context.mappingModel['kol_users'];
        const kolUsers = await KolUserModel.find();

        const mappingJob: object = {};
        const mappingShareStory: object = {};
        const mappingLocation: object = {};
        // get data
        (await context._catJobModel.find()).forEach(cat => {
            cat.jobs.forEach(job => {
                mappingJob[job.static_id] = job._id;
            });
        });

        (await context._catShareStoryModel.find()).forEach(cat => {
            cat.share_stories.forEach(share_story => {
                mappingShareStory[share_story.static_id] = share_story._id;
            });
        });

        const KolInfoModel = context.mappingModel['kol_infos'];
        (await KolInfoModel.find({ 'kol_evaluate.province': { $exists: true } })).forEach(kInfo => {
            mappingLocation[kInfo['email']] = {
                province: kInfo['kol_evaluate']['province'],
                country: kInfo['kol_evaluate']['country']
            };
        });

        const fixData = async (kolUser: object) => {
            const assign = Object.assign({}, kolUser);
            const obj = assign['_doc'];

            // convert evaluate
            if (obj['kol_info']['kol_evaluate']) {
                // fb
                obj['kol_info']['evaluate'] = obj['kol_info']['kol_evaluate'];
                obj['kol_info']['evaluate']['fb']['frequency'] = parseInt(
                    obj['kol_info']['evaluate']['fb']['frequency'][0]
                );
                obj['kol_info']['evaluate']['fb']['style'] = parseInt(obj['kol_info']['evaluate']['fb']['style'][0]);
                obj['kol_info']['evaluate']['fb']['content'] = obj['kol_info']['evaluate']['fb']['content'].map(v => {
                    return parseInt(v);
                });

                // text
                obj['kol_info']['evaluate']['text']['length'] = parseInt(
                    obj['kol_info']['evaluate']['text']['length'][0]
                );
                obj['kol_info']['evaluate']['text']['interactivity'] = parseInt(
                    obj['kol_info']['evaluate']['text']['interactivity'][0]
                );
                obj['kol_info']['evaluate']['text']['swearing_happy'] = parseInt(
                    obj['kol_info']['evaluate']['text']['swearing_happy'][0]
                );

                // image
                obj['kol_info']['evaluate']['image']['content'] = obj['kol_info']['evaluate']['image']['content'].map(
                    v => {
                        return parseInt(v);
                    }
                );

                obj['kol_info']['evaluate']['image']['personal_style'] = obj['kol_info']['evaluate']['image'][
                    'personal_style'
                ].map(v => {
                    return parseInt(v);
                });
                obj['kol_info']['evaluate']['image']['scenery'] = parseInt(
                    obj['kol_info']['evaluate']['image']['scenery'][0]
                );
                obj['kol_info']['evaluate']['image']['refine_content'] = parseInt(
                    obj['kol_info']['evaluate']['image']['refine_content'][0]
                );

                // general style

                obj['kol_info']['evaluate']['general_style']['appearence'] = parseInt(
                    obj['kol_info']['evaluate']['general_style']['appearence'][0]
                );
                obj['kol_info']['evaluate']['general_style']['brand'] = parseInt(
                    obj['kol_info']['evaluate']['general_style']['brand'][0]
                );
            } else {
                obj['kol_info']['evaluate'] = {};
            }

            // convert payment
            if (obj['payment']) {
                if (obj['payment']['delivery_info']) {
                    obj['delivery_info'] = obj['payment']['delivery_info'];
                }

                if (obj['payment']['payment_info']) {
                    obj['payment_info'] = obj['payment']['payment_info'];
                }
            }

            // convert email status
            obj['verify'] = {
                email: false
            };
            obj['token'] = {
                email: {}
            };

            if (obj['verify_email'] && obj['verify_email']['status']) {
                if (obj['verify_email']['status'] == 'accept') {
                    obj['verify']['email'] = true;
                    obj['token']['email']['status'] = KolInfoStatus.Verified;
                }
            }

            // set status kol info
            if (obj['kol_info'] && obj['kol_info']['status']) {
                if (obj['kol_info']['status'] == 'verified') {
                    obj['kol_info']['status'] = KolInfoStatus.Verified;
                } else if (obj['kol_info']['status'] == 'rejected') {
                    obj['kol_info']['status'] = KolInfoStatus.Rejected;
                } else {
                    obj['kol_info']['status'] = KolInfoStatus.Raw;
                }
            } else {
                obj['kol_info']['status'] = KolInfoStatus.Raw;
            }

            if (obj['kol_info'] && obj['kol_info']['notification_job']) {
                obj['kol_info']['notification_job'] = 1 == parseInt(obj['kol_info']['notification_job']);
            }


            // format dob
            if (obj['kol_info'] && obj['kol_info']['dob']) {
                try {
                    if (isNaN(obj['kol_info']['dob'])) {
                        obj['kol_info']['dob'] = 0;
                    } else if (isString(obj['kol_info']['dob'])){
                        if (obj['kol_info']['dob'].match(/[0-9]*/))  {
                            obj['kol_info']['dob'] = parseInt(obj['kol_info']['dob']);
                        } else {
                            const date = new Date(obj['kol_info']['dob']);
                            if (isNaN(date.getTime())) {
                                obj['kol_info']['dob'] = 0;
                            } else {
                                obj['kol_info']['dob'] = date.getTime() / 1000;
                            }
                        }
                    }
                } catch (error) {
                    obj['kol_info']['dob'] = 0;
                }
            }

            // mapping job
            if (obj['kol_info'] && obj['kol_info']['job'] && obj['kol_info']['job'].length > 0) {
                const ids: Array<string> = [];
                obj['kol_info']['job'].forEach(static_id => {
                    ids.push(mappingJob[parseInt(static_id)]);
                });
                obj['kol_info']['job'] = ids;
            }

            // mapping share story
            if (obj['kol_info'] && obj['kol_info']['share_story'] && obj['kol_info']['share_story'].length > 0) {
                const ids: Array<string> = [];
                obj['kol_info']['share_story'].forEach(static_id => {
                    ids.push(mappingShareStory[parseInt(static_id)]);
                });
                obj['kol_info']['share_story'] = ids;
            }

            // mapping location
            if (mappingLocation[obj['email']]) {
                obj['kol_info']['evaluate']['province'] = mappingLocation[obj['email']]['province'];
                obj['kol_info']['evaluate']['country'] = mappingLocation[obj['email']]['country'];
            }

            // step
            if (obj['kol_info'] && obj['kol_info']['step']) {
                if (obj['kol_info']['step'] == 'completed') {
                    obj['kol_info']['step'] = 1;
                } else {
                    obj['kol_info']['step'] = 0;
                }
            }

            // verify_email
            if (obj['verify_email'] && obj['verify_email']['status'] == 'accept') {
                obj['verify'] = {};
                obj['verify']['email'] = true;
            }

            obj['rate'] = {};
            if (obj['num_rate']) {
                obj['rate']['num'] = obj['num_rate'];
            }

            if (obj['num_rate_evaluate']) {
                obj['rate']['evaluate'] = {};
                obj['rate']['evaluate']['count'] = obj['num_rate_evaluate'];
            }

            // num child
            if (obj['kol_info'] && !obj['kol_info']['num_child']) {
                obj['kol_info']['num_child'] = -1;
            }

            // sex

            if (obj['kol_info'] && obj['kol_info']['sex'] != null && obj['kol_info']['sex'] != undefined && obj['kol_info']['sex'].length > 0) {
                const sex = parseInt(obj['kol_info']['sex']);

                if (sex != 0 && sex != 1) {
                    obj['kol_info']['sex'] = -1;
                } else {
                    obj['kol_info']['sex'] = sex;
                }
            } else {
                obj['kol_info']['sex'] = -1;
            }

            // matrimony
            if (obj['kol_info'] && obj['kol_info']['matrimony'] != null && obj['kol_info']['matrimony'] != undefined  && obj['kol_info']['matrimony'].length > 0) {
                const matrimony = parseInt(obj['kol_info']['matrimony']);

                if (matrimony != 0 && matrimony != 1) {
                    obj['kol_info']['matrimony'] = -1;
                } else {
                    obj['kol_info']['matrimony'] = matrimony;
                }
            } else {
                obj['kol_info']['matrimony'] = -1;
            }

            if (obj['password']) {
                obj['password'] = obj['password'].replace(/^\$2y/g, '$2b');
            }

            return <IKolUser>obj;
        };

        const data: Array<object> = [];
        for (const kolUser of kolUsers) {
            try {
                if (kolUser.email) {
                    data.push(await fixData(kolUser));
                }
            } catch (error) {
                console.log(kolUser);
                throw error;
            }
        }
        const result = await context._kolUserModel.insertMany(<IKolUser[]>data);
        console.log('\x1b[31m', `created category reason: ${result.length}`, '\x1b[0m');
    }
}
