import * as _ from 'lodash';
import * as path from 'path';

import { Injectable } from 'System/Injectable';
import { Config } from 'System/Config';
import { PackageModel, IPackage, IGroup } from 'App/Models/PackageModel';
import { NotFound, BadRequest, Conflict } from 'System/Error';
import { FileStorage } from 'System/FileStorage';
import { ImageMIME } from 'System/Enum/MIME';
import { DefaultImage } from 'App/Constants/DefaultImage';
import { PackageSearchField, Package } from 'Database/Schema/PackageSchema';
import { KolUserModel } from 'App/Models/KolUserModel';
import { CategoryJobModel } from 'App/Models/CategoryJobsModel';
import { CategoryShareStoryModel } from 'App/Models/CategoryShareStoryModel';
import { generateSlug } from 'App/Helpers/Generator';
import { ProvinceModel } from 'App/Models/ProvinceModel';
import { evaluateOption } from 'App/Constants/Evaluate';
import { getTopFrequencyValue } from 'App/Helpers/Format';

export interface IPackageStats {
    total_post: number;
    total_follower: number;
    total_average_engagement: number;
    location: any;
    total_engagement: number;
    total_buzz: number;
    total_influencer: number;
    occupation: any;
    topic: any;
    gender: any;
    follower_range: {
        from: number;
        to: number;
    };
    style: any;
    estimated_engagement: number;
    cost_per_engagement: number;
    cost_per_influencer: number;
}

@Injectable
export class PackageService {
    readonly defaultGroupPopulation = [
        {
            path: 'groups.kols',
            select:
                'facebook.analytic kol_info.evaluate.province facebook.name kol_info.sex kol_info.dob facebook.entity_id kol_info.job kol_info.share_story kol_info.evaluate.fb.style'
        }
    ];

    constructor(
        private readonly _config: Config,
        private readonly _pkgModel: PackageModel,
        private readonly _storage: FileStorage,
        private readonly _kol: KolUserModel,
        private readonly _categoryJobModel: CategoryJobModel,
        private readonly _shareStoryModel: CategoryShareStoryModel,
        private readonly _province: ProvinceModel
    ) {}

    async create(data: IPackage, coverUrlInfo?: any) {
        if (data.tmp_cover) {
            let tmpPath = path.join(this._config.storage.tmp, data.tmp_cover);

            if (!(await this._storage.checkFileExist(tmpPath)))
                throw new BadRequest({ fields: { tmp_cover: 'TEMP_PACKAGE_COVER_NOT_FOUND' } });

            if (!(await this._storage.checkUploadFileType(tmpPath, ImageMIME)))
                throw new BadRequest({ fields: { tmp_cover: 'IMAGE_WRONG_TYPE' } });
        }

        if (data.occupations && !(await this.isOccupationsValid(data.occupations)))
            throw new BadRequest({ fields: { occupations: 'OCCUPATIONS_NOT_FOUND' } });

        if (data.topics && !(await this.isTopicsValid(data.topics)))
            throw new BadRequest({ fields: { topics: 'TOPICS_NOT_FOUND' } });

        let slugList = (await this._pkgModel.find().select('slug')).map(item => item.slug);

        data.slug = generateSlug(data.name, slugList);

        data.groups = [];

        let pkg = await this._pkgModel.create(data);

        if (data.tmp_cover) {
            await this._storage.storeUploadFile(
                path.join(this._config.storage.tmp, data.tmp_cover),
                'package_cover',
                pkg.id
            );
        }

        if (coverUrlInfo) {
            pkg.cover_url = coverUrlInfo.baseUrl + pkg.id + coverUrlInfo.path;
        }

        pkg.stats = this.aggregateGroups(pkg.groups, +pkg.package_price);

        await this.populatePackage(pkg);

        return pkg;
    }

    async uploadCover(id: string, cover: any) {
        let pkg = await this.findById(id);

        if (!pkg) throw new NotFound('PACKAGE_NOT_FOUND');

        if (await this._storage.checkUploadFileType(cover.path, ImageMIME)) {
            return await this._storage.storeUploadFile(cover.path, 'package_cover', id);
        }

        throw new BadRequest({ fields: { cover: 'IMAGE_WRONG_TYPE' } });
    }

    async uploadTempCover(cover: any) {
        if (cover && cover.path && (await this._storage.checkUploadFileType(cover.path, ImageMIME))) {
            return { tmp_cover: path.basename(cover.path) };
        }

        throw new BadRequest({ fields: { tmp_cover: 'IMAGE_WRONG_TYPE' } });
    }

    async createGroup(id: string, groupData: IGroup) {
        let pkg = await this._pkgModel.findById(id, '+groups +package_price');

        if (!pkg) throw new NotFound('PACKAGE_NOT_FOUND');

        if (pkg.groups.map(item => item.tag).indexOf(groupData.tag) !== -1) {
            throw new Conflict('GROUP_TAG_DUPLLICATED');
        }

        pkg.groups.push(groupData);

        await pkg.save();

        await this.populateGroup(pkg);

        pkg.stats = this.aggregateGroups(pkg.groups, +pkg.package_price);

        return pkg;
    }

    async updatePackageById(id: string, pkgData: IPackage, coverUrlInfo?: any) {
        let pkg = await this._pkgModel.findById(id);

        if (!pkg) throw new NotFound('PACKAGE_NOT_FOUND');

        if (pkgData.occupations && !(await this.isOccupationsValid(pkgData.occupations)))
            throw new BadRequest({ fields: { occupations: 'OCCUPATIONS_NOT_FOUND' } });

        if (pkgData.topics && !(await this.isTopicsValid(pkgData.topics)))
            throw new BadRequest({ fields: { topics: 'TOPICS_NOT_FOUND' } });

        if (pkgData.name) pkg.name = pkgData.name;
        if (pkgData.description) pkg.description = pkgData.description;
        if (pkgData.package_price) pkg.package_price = pkgData.package_price;
        if (pkgData.post_type) pkg.post_type = pkgData.post_type;
        if (pkgData.occupations) pkg.occupations = pkgData.occupations;
        if (pkgData.topics) pkg.topics = pkgData.topics;
        if (pkgData.male_percent) pkg.male_percent = pkgData.male_percent;
        if (pkgData.location) pkg.location = pkgData.location;
        if (pkgData.age_average) pkg.age_average = pkgData.age_average;
        if (pkgData.is_public !== undefined) pkg.is_public = pkgData.is_public;
        if (pkgData.is_public !== undefined) pkg.show_dashboard = pkgData.show_dashboard;
        if (pkgData.is_public !== undefined) pkg.is_instant = pkgData.is_instant;
        if (pkgData.display_stats !== undefined) pkg.display_stats = pkgData.display_stats;
        if (pkgData.slug) pkg.slug = pkgData.slug;

        let tmp = await pkg.save();

        if (coverUrlInfo) {
            tmp.cover_url = coverUrlInfo.baseUrl + tmp.id + coverUrlInfo.path;
        }

        await this.populateGroup(pkg);

        pkg.stats = this.aggregateGroups(pkg.groups, +pkg.package_price);

        tmp.groups = [];

        await this.populatePackage(pkg);

        return pkg;
    }

    async deletePackageById(id: string) {
        let pkg = await this.findById(id);

        if (!pkg) throw new NotFound('PACKAGE_NOT_FOUND');

        await pkg.remove();

        return { result: 'OK' };
    }

    async deleteGroupByTag(id: string, tag: number) {
        let pkg = await this._pkgModel.findById(id, '+groups +package_price');

        if (!pkg) throw new NotFound('PACKAGE_NOT_FOUND');

        let groupIndex = pkg.groups.map(item => item.tag).indexOf(tag);

        if (groupIndex === -1) throw new NotFound('GROUP_TAG_NOT_FOUND');

        pkg.groups.splice(groupIndex, 1);

        await pkg.save();

        await this.populateGroup(pkg);

        pkg.stats = this.aggregateGroups(pkg.groups, +pkg.package_price);

        return pkg;
    }

    async insertKolsIntoGroupByTag(id: string, tag: number, kolList: string[]) {
        let pkg = await this._pkgModel.findById(id, '+groups +package_price');

        if (!pkg) throw new NotFound('PACKAGE_NOT_FOUND');

        let groupIndex = pkg.groups.map(item => item.tag).indexOf(tag);

        if (groupIndex === -1) throw new NotFound('GROUP_TAG_NOT_FOUND');

        let kols = await this._kol.find({ _id: { $in: kolList } });

        if (kols.length !== kolList.length) throw new BadRequest({ fields: { kol_list: 'KOLS_NOT_FOUND' } });

        let uniqueKols = _.uniq(pkg.groups[groupIndex].kols.map(item => item.toString()).concat(kolList));

        pkg.groups[groupIndex].kols = uniqueKols;

        await pkg.save();

        await this.populateGroup(pkg);

        pkg.stats = this.aggregateGroups(pkg.groups, +pkg.package_price);

        return pkg;
    }

    async updateGroupInfo(id: string, tag: number, groupData: IGroup) {
        let pkg = await this._pkgModel.findById(id, '+groups +package_price');

        if (!pkg) throw new NotFound('PACKAGE_NOT_FOUND');

        let groupIndex = pkg.groups.map(item => item.tag).indexOf(tag);

        if (groupIndex === -1) throw new NotFound('GROUP_TAG_NOT_FOUND');

        if (groupData.tag !== undefined && groupData.tag !== tag) {
            if (pkg.groups.map(item => item.tag).indexOf(groupData.tag) !== -1)
                throw new Conflict('GROUP_TAG_DUPLLICATED');
            pkg.groups[groupIndex].tag = groupData.tag;
        }

        if (groupData.price) pkg.groups[groupIndex].price = groupData.price;

        await pkg.save();

        await this.populateGroup(pkg);

        pkg.stats = this.aggregateGroups(pkg.groups, +pkg.package_price);

        return pkg;
    }

    async deleteKolsFromPackage(id: string, deleteList: IGroup[] = []) {
        let pkg = await this._pkgModel.findById(id, '+groups +package_price');

        if (!pkg) throw new NotFound('PACKAGE_NOT_FOUND');

        deleteList.forEach(group => {
            let groupIndex = pkg!.groups.map(item => item.tag).indexOf(group.tag);

            if (groupIndex === -1) throw new NotFound('GROUP_TAG_NOT_FOUND');

            let existedKols: string[] = pkg!.groups[groupIndex].kols.map(item => item.toString());

            if (group.kols!.length < 1) throw new BadRequest({ fields: { kol_list: 'KOLS_NOT_FOUND' } });

            if (_.intersection(existedKols, group.kols!).length !== group.kols!.length) {
                throw new BadRequest({ fields: { kol_list: 'KOLS_NOT_FOUND' } });
            }

            let remainKol = _.difference(existedKols, group.kols!);

            pkg!.groups[groupIndex].kols = remainKol;
        });

        await pkg.save();

        await this.populateGroup(pkg);

        pkg.stats = this.aggregateGroups(pkg.groups, +pkg.package_price);

        return pkg;
    }

    async populateGroup(pkg: any) {
        await pkg.populate(this.defaultGroupPopulation).execPopulate();

        let provinces = await this._province.find().select('name code');
        let provinceList: any = [];
        provinces.map(item => {
            provinceList[item.code] = item.code;
        });

        let occupations = await this._categoryJobModel.find();
        let occupationList: any = [];
        occupations.map(item => item.jobs.map(job => (occupationList[job._id] = job.name)));

        let topics = await this._shareStoryModel.find();
        let topicList: any = [];
        topics.map(item => item.share_stories.map(shareStory => (topicList[shareStory._id] = shareStory.name)));

        if (pkg.groups)
            pkg.groups.forEach(group => {
                group.kols.forEach(kol => {
                    if (
                        kol.kol_info.evaluate &&
                        kol.kol_info.evaluate.province &&
                        Object.keys(provinceList).indexOf(kol.kol_info.evaluate.province) !== -1
                    )
                        kol.kol_info.evaluate.province = provinceList[kol.kol_info.evaluate.province];

                    if (kol.kol_info.job)
                        kol.kol_info.job.forEach((job, index) => {
                            if (Object.keys(occupationList).indexOf(job.toString()) !== -1) {
                                kol.kol_info.job[index] = occupationList[job];
                            }
                        });

                    if (kol.kol_info.share_story)
                        kol.kol_info.share_story.forEach((shareStory, index) => {
                            if (Object.keys(topicList).indexOf(shareStory.toString()) !== -1) {
                                kol.kol_info.share_story[index] = topicList[shareStory];
                            }
                        });
                });
            });
    }

    async getCoverAbsolutePath(id: string, is_public: boolean = false) {
        let pkg =
            is_public === true
                ? await this._pkgModel.findOne({ _id: id, is_public: is_public })
                : await this._pkgModel.findById(id);

        if (!pkg) throw new NotFound('PACKAGE_NOT_FOUND');

        return (
            (await this._storage.getAbsoluteFilePath('package_cover', id)) ||
            (await this._storage.getAbsoluteFilePath('package_cover', DefaultImage.BRAND_AVATAR_IMAGE))
        );
    }

    async findById(id: string, coverUrlInfo?: any, keepGroups: boolean = false) {
        let pkg = await this._pkgModel.findById(id);

        if (!pkg) throw new NotFound('PACKAGE_NOT_FOUND');

        if (coverUrlInfo) {
            pkg.cover_url = coverUrlInfo.baseUrl + pkg.id + coverUrlInfo.path;
        }

        await this.populateGroup(pkg);

        pkg.stats = this.aggregateGroups(pkg.groups, +pkg.package_price);

        if (!keepGroups) pkg.set('groups', undefined, { strict: false });

        await this.populatePackage(pkg);

        return pkg;
    }

    async findBySlug(slug: string, coverUrlInfo?: any) {
        let pkg = await this._pkgModel.findOne({ is_public: true, slug: slug });

        if (!pkg) throw new NotFound('PACKAGE_NOT_FOUND');

        if (coverUrlInfo) {
            pkg.cover_url = coverUrlInfo.baseUrl + pkg.id + coverUrlInfo.path;
        }

        await this.populateGroup(pkg);

        pkg.stats = this.aggregateGroups(pkg.groups, +pkg.package_price);

        await this.populatePackage(pkg);

        // sort by kol count and reduce amount of influencer
        let kols: any = [];

        pkg.groups.map(group => {
            kols = kols.concat(group.kols);
        });

        kols = _.sortBy(kols, 'facebook.analytic.total_follower').reverse();

        kols = kols.slice(0, 10);

        pkg.groups = pkg.groups.splice(0, 1);

        pkg.groups[0].kols = kols;

        return pkg;
    }

    async getGroupsByPackageId(id: string) {
        let pkg = await this._pkgModel.findById(id, '+groups +package_price');

        if (!pkg) throw new NotFound('PACKAGE_NOT_FOUND');

        await this.populateGroup(pkg);

        pkg.stats = this.aggregateGroups(pkg.groups, +pkg.package_price);

        return pkg;
    }

    async findPackageWithFilter(conditions?: any, avatarUrlInfo?: any) {
        let pkgs = await this._pkgModel.findWithFilter(conditions, PackageSearchField);

        for await (let pkg of pkgs.results) {
            await this.populateGroup(pkg);

            pkg.stats = this.aggregateGroups(pkg.groups, +pkg.package_price);

            pkg.groups = [];

            await this.populatePackage(pkg);
        }

        if (avatarUrlInfo) {
            pkgs.results.forEach(pkg => {
                pkg.cover_url = avatarUrlInfo.baseUrl + pkg.id + avatarUrlInfo.path;
            });
        }

        return pkgs;
    }

    async isOccupationsValid(occList: string[]) {
        let occs: any = await this._categoryJobModel.find({ 'jobs._id': { $in: occList } }, { jobs: 1 });

        occs = _.flattenDeep(occs.map(item => item.jobs.map(j => j._id.toString())));

        if (occList && occList.length === _.intersection(occs, occList).length) return true;

        return false;
    }

    async isTopicsValid(topicsList: string[]) {
        let topics: any = await this._shareStoryModel.find(
            { 'share_stories._id': { $in: topicsList } },
            { share_stories: 1 }
        );

        topics = _.flattenDeep(topics.map(item => item.share_stories.map(j => j._id.toString())));

        if (topicsList && topicsList.length === _.intersection(topics, topicsList).length) return true;

        return false;
    }

    async populatePackage(pkg: Package) {
        let occs: any = await this._categoryJobModel.find({ 'jobs._id': { $in: pkg.occupations } }, { jobs: 1 });

        occs = _.flattenDeep(occs.map(item => item.jobs));

        pkg.occupations = _.filter(occs, function(o) {
            if (pkg.occupations.indexOf(o._id) !== -1) return true;
            return false;
        });

        let topics: any = await this._shareStoryModel.find(
            { 'share_stories._id': { $in: pkg.topics } },
            { share_stories: 1 }
        );

        topics = _.flattenDeep(topics.map(item => item.share_stories));

        pkg.topics = _.filter(topics, function(o) {
            if (pkg.topics.indexOf(o._id) !== -1) return true;
            return false;
        });
    }

    aggregateGroups(groups: any, totalCost: number) {
        let result: IPackageStats = {
            total_influencer: 0,
            total_post: 0,
            total_follower: 0,
            total_average_engagement: 0,
            location: [],
            total_engagement: 0,
            total_buzz: 0,
            occupation: [],
            topic: [],
            gender: [],
            follower_range: {
                from: 0,
                to: 0
            },
            style: [],
            estimated_engagement: 0,
            cost_per_engagement: 0,
            cost_per_influencer: 0
        };

        let kolList: any = [];

        kolList = [].concat(...groups.map(item => item.kols));

        kolList = kolList.map(item => {
            let tmp: any = {
                analytic: {
                    total_follower: 0,
                    total_post_last_3_month: 0,
                    avg_reaction_last_3_month: 0,
                    avg_comment_last_3_month: 0,
                    avg_sharing_last_3_month: 0,
                    avg_engagement_last_3_month: 0
                },
                location: '',
                occupation: [],
                topic: [],
                style: '',
                gender: 0
            };

            if (item.facebook && item.facebook.analytic) tmp.analytic = item.facebook.analytic;
            if (item.kol_info.evaluate && item.kol_info.evaluate.province) {
                tmp.location = item.kol_info.evaluate.province;
            }

            if (item.kol_info.job) tmp.occupation = item.kol_info.job;
            if (item.kol_info.share_story) tmp.topic = item.kol_info.share_story;
            if (item.kol_info.evaluate && item.kol_info.evaluate.fb && item.kol_info.evaluate.fb.style !== undefined)
                tmp.style = evaluateOption.fb.style.a[item.kol_info.evaluate.fb.style];

            tmp.gender = item.kol_info.sex;

            return tmp;
        });

        kolList.map(item => {
            result.total_post += item.analytic.total_post_last_3_month || 0;
            result.total_average_engagement += item.analytic.avg_engagement_last_3_month || 0;
            result.total_engagement +=
                (item.analytic.avg_engagement_last_3_month || 0) *
                (item.analytic.total_post_last_3_month > 30 ? 30 : item.analytic.total_post_last_3_month);
            result.total_buzz +=
                (item.analytic.avg_comment_last_3_month + item.analytic.avg_sharing_last_3_month) *
                    item.analytic.total_post_last_3_month || 0;

            if (item.location) result.location.push(item.location);
            if (item.occupation) result.occupation = result.occupation.concat(item.occupation);
            if (item.topic) result.topic = result.topic.concat(item.topic);
            if (item.style) result.style.push(item.style);
            if (item.gender !== undefined) result.gender.push(item.gender);

            result.total_follower += item.analytic.total_follower || 0;
            if (!result.follower_range.from) result.follower_range.from = item.analytic.total_follower;
            result.follower_range.from = Math.min(result.follower_range.from, item.analytic.total_follower);
            result.follower_range.to = Math.max(result.follower_range.to, item.analytic.total_follower);
        });

        result.follower_range.from = Math.round(result.follower_range.from / 1000) * 1000 || 0;
        result.follower_range.to = (Math.round(result.follower_range.to / 1000) + 1) * 1000 || 0;

        result.location = getTopFrequencyValue(result.location);
        result.occupation = getTopFrequencyValue(result.occupation, 3, kolList.length);
        result.topic = getTopFrequencyValue(result.topic, 3, kolList.length);
        result.style = getTopFrequencyValue(result.style, 3, kolList.length);
        result.gender = _.countBy(result.gender);
        result.total_influencer = kolList.length;

        result.estimated_engagement = result.total_average_engagement;

        result.cost_per_engagement = Math.round(totalCost / result.estimated_engagement);
        if (!result.estimated_engagement) result.cost_per_engagement = 0;

        result.cost_per_influencer = Math.round(totalCost / result.total_influencer);
        if (!result.total_influencer) result.cost_per_influencer = 0;

        return result;
    }
}
