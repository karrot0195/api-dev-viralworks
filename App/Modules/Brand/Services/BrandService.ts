import * as path from 'path';
import * as _ from 'lodash';

import { Injectable } from 'System/Injectable';
import { Config } from 'System/Config';
import { FileStorage } from 'System/FileStorage';
import { BrandModel, IBrand } from 'App/Models/BrandModel';
import { BadRequest, NotFound, Forbidden } from 'System/Error';
import * as Security from 'System/Helpers/Security';
import { BrandSearchField } from 'Database/Schema/BrandSchema';
import { ImageMIME } from 'System/Enum/MIME';
import { DefaultImage } from 'App/Constants/DefaultImage';
import { PackageModel, IGroup } from 'App/Models/PackageModel';
import { JobModel } from 'App/Models/JobModel';
import { PackageSearchField } from 'Database/Schema/PackageSchema';
import { SearchField } from 'App/Models/KolJobModel';
import { JobService } from 'App/Modules/Job/Services/JobService';
import { PackageService } from 'App/Modules/PublicPackage/Services/PackageService';
import { Job } from 'Database/Schema/JobSchema';

export interface ICustomPackageFilter {
    priceMin: number;
    priceMax: number;
    postType?: number;
}

@Injectable
export class BrandService {
    constructor(
        private readonly _config: Config,
        private readonly _brandModel: BrandModel,
        private readonly _storage: FileStorage,
        private readonly _packageModel: PackageModel,
        private readonly _packageService: PackageService,
        private readonly _jobModel: JobModel,
        private readonly _jobService: JobService
    ) {}

    async findById(id: string, fields?: string, avatarUrlInfo?: any) {
        let brand = await this._brandModel.findById(id, fields);

        if (!brand) throw new NotFound('BRAND_NOT_FOUND');

        if (avatarUrlInfo) {
            brand.avatar_url = avatarUrlInfo.baseUrl + brand.id + avatarUrlInfo.path;
        }

        return brand;
    }

    async create(data: IBrand, avatarUrlInfo?: any) {
        data.password = Security.hash(this._config.security.pepper + data.password);

        data.is_disabled = false;

        if (data.tmp_avatar) {
            let tmpPath = path.join(this._config.storage.tmp, data.tmp_avatar);

            if (!await this._storage.checkFileExist(tmpPath))
                throw new BadRequest({ fields: { tmp_avatar: 'TEMP_AVATAR_NOT_FOUND' } });

            if (!await this._storage.checkUploadFileType(tmpPath, ImageMIME))
                throw new BadRequest({ fields: { avatar: 'IMAGE_WRONG_TYPE' } });
        }

        let result = await this._brandModel.create(data);

        if (data.tmp_avatar) {
            await this._storage.storeUploadFile(
                path.join(this._config.storage.tmp, data.tmp_avatar),
                'brand_avatar',
                result.id
            );
        }

        result.password = '';

        if (avatarUrlInfo) {
            result.avatar_url = avatarUrlInfo.baseUrl + result.id + avatarUrlInfo.path;
        }

        return result;
    }

    async findBrandWithFilter(conditions?: any, avatarUrlInfo?: any) {
        let tmp = await this._brandModel.findWithFilter(conditions, BrandSearchField);

        if (avatarUrlInfo) {
            tmp.results.forEach(user => {
                user.avatar_url = avatarUrlInfo.baseUrl + user.id + avatarUrlInfo.path;
            });
        }

        return tmp;
    }

    async updateBrandById(id: string, brandData: IBrand, avatarUrlInfo?: any) {
        let brand = await this.findById(id);

        if (!brand) throw new NotFound('BRAND_NOT_FOUND');

        if (brandData.name) brand.name = brandData.name;
        if (brandData.email) brand.email = brandData.email;
        if (brandData.password) brand.password = Security.hash(this._config.security.pepper + brandData.password);
        if (brandData.phone) brand.phone = brandData.phone;

        if (brandData.is_disabled !== undefined) brand.is_disabled = brandData.is_disabled;

        let tmp = await brand.save();

        tmp.password = '';

        if (avatarUrlInfo) {
            tmp.avatar_url = avatarUrlInfo.baseUrl + tmp.id + avatarUrlInfo.path;
        }

        return tmp;
    }

    async uploadAvatar(id: string, avatar: any) {
        let brand = await this.findById(id);

        if (!brand) throw new NotFound('BRAND_NOT_FOUND');

        if (await this._storage.checkUploadFileType(avatar.path, ImageMIME)) {
            return await this._storage.storeUploadFile(avatar.path, 'brand_avatar', id);
        }

        throw new BadRequest({ fields: { avatar: 'IMAGE_WRONG_TYPE' } });
    }

    async uploadTempAvatar(avatar: any) {
        if (avatar && avatar.path && (await this._storage.checkUploadFileType(avatar.path, ImageMIME))) {
            return { tmp_avatar: path.basename(avatar.path) };
        }

        throw new BadRequest({ fields: { avatar: 'IMAGE_WRONG_TYPE' } });
    }

    async getAvatarAbsolutePath(id: string) {
        let brand = await this.findById(id);

        if (!brand) throw new NotFound('BRAND_NOT_FOUND');

        return (
            (await this._storage.getAbsoluteFilePath('brand_avatar', id)) ||
            (await this._storage.getAbsoluteFilePath('brand_avatar', DefaultImage.BRAND_AVATAR_IMAGE))
        );
    }

    /**
     * Bookmark a package to brand
     *
     * @param brandId Brand objectId
     * @param packageId Package objectId
     *
     * @return {Promise} Brand save function
     */
    async bookmarkPackage(brandId: string, packageId: string) {
        let brand = await this._brandModel.findById(brandId).select('bookmark_packages');

        if (!brand) throw new Forbidden('FORBIDDEN');

        let pkg = await this._packageModel.findById(packageId);

        if (!pkg) throw new BadRequest({ fields: { package: 'PACKAGE_NOT_FOUND' } });

        brand.bookmark_packages = _.union(brand.bookmark_packages.map(o => o.toString()), [pkg.id]);

        return brand.save();
    }

    /**
     * Remove bookmark from brand
     *
     * @param brandId Brand objectId
     * @param packageId Package objectId
     *
     * @return {Promise} Brand save function
     */
    async removeBookmarkPackage(brandId: string, packageId: string) {
        let brand = await this._brandModel.findById(brandId).select('bookmark_packages');

        if (!brand) throw new Forbidden('FORBIDDEN');

        let bookmarkIndex = brand.bookmark_packages.map(o => o.toString()).indexOf(packageId);

        if (bookmarkIndex === -1) throw new BadRequest({ fields: { package: 'PACKAGE_NOT_FOUND' } });

        brand.bookmark_packages = _.remove(brand.bookmark_packages.map(o => o.toString()), item => item !== packageId);

        return brand.save();
    }

    /**
     * Count KOL of a package
     *
     * @param groups KOL groups of package
     *
     * @return {number} KOL Count of all groups
     */
    countKols(groups: IGroup[]) {
        let count = 0;

        groups.map(o => (count += o.kols!.length || 0));

        return count;
    }

    /**
     * Update total influencer field of a list of package
     *
     * @param packages List package that need to count total influencer
     *
     * @return {void}
     */
    updateTotalInfluencer(packages: any[]) {
        packages.forEach((o: any, index: number) => {
            packages[index]['set']('total_influencer', this.countKols(o.groups), { strict: false });
            packages[index]['set']('groups', undefined, { strict: false });
        });
    }

    /**
     * Get all bookmark package of brand
     *
     * @param brandId Brand ObjectId
     *
     * @return {Promise} All bookmark package
     */
    async findBookmarkPackage(
        brandId: string,
        conditions: any,
        customFilter: ICustomPackageFilter,
        coverUrlInfo?: any
    ) {
        let brand = await this._brandModel.findById(brandId).select('bookmark_packages');

        if (!brand) throw new Forbidden('FORBIDDEN');

        let bookmarks = brand.bookmark_packages.map(o => o.toString());

        return this.getDashboardPackages(brandId, conditions, customFilter, false, bookmarks, coverUrlInfo);
    }

    /**
     * Show stats that show on sidebar
     *
     * @param brandId Brand ObjectId
     *
     * @return {Object} Stats that show on sidebar
     */
    async getDashboardSidebarStats(brandId: string) {
        let brand = await this._brandModel.findById(brandId);

        if (!brand) throw new Forbidden('FORBIDDEN');

        let result = {
            total_package: 0,
            total_ongoing_job: 0,
            total_completed_job: 0
        };

        result.total_package = await this._packageModel.find({ show_dashboard: true }).count();

        result.total_ongoing_job = await this._jobModel.find({ assign_brand: brandId, status: 2 }).count();

        result.total_completed_job = await this._jobModel.find({ assign_brand: brandId, status: 3 }).count();

        return result;
    }

    /**
     * Get dashboard packages for specified brand
     *
     * @param brandId Brand ObjectId
     * @param conditions Query parameters
     * @param customFilter Additional filter that not in default conditions
     * @param isInstant is_instant condition
     * @param searchIds Array of package id that need to search
     *
     * @return {Package[]} Array of dashboard packages
     */
    async getDashboardPackages(
        brandId: string,
        conditions: any,
        customFilter: ICustomPackageFilter,
        isInstant: boolean = false,
        searchIds?: string[],
        coverUrlInfo?: any
    ) {
        let brand = await this._brandModel.findById(brandId).select('bookmark_packages');

        if (!brand) throw new Forbidden('FORBIDDEN');

        // hook function for custom filter
        let addCustomFilter = function(query: any) {
            // only show dashboard
            query.conditions['show_dashboard'] = true;

            // process price range
            if (customFilter.priceMin || customFilter.priceMax)
                if (!query.conditions['package_price']) query.conditions['package_price'] = {};

            if (customFilter.priceMin) query.conditions['package_price'].$gte = customFilter.priceMin;
            if (customFilter.priceMax) query.conditions['package_price'].$lte = customFilter.priceMax;

            // process post type
            if (customFilter.postType !== undefined) query.conditions['post_type'] = customFilter.postType;

            // check instant
            if (isInstant) query.conditions['is_instant'] = true;

            // check search ids
            if (searchIds) query.conditions['_id'] = { $in: searchIds };
        };

        // select fields
        conditions.fields = 'groups,package_price,post_type,description';

        let packages = await this._packageModel.findWithFilter(conditions, PackageSearchField, {
            beforeQuery: addCustomFilter
        });

        // fill bookmark marker
        let bookmarks = brand.bookmark_packages.map(o => o.toString());

        packages.results.forEach(pkg => {
            if (bookmarks.indexOf(pkg.id) !== -1) pkg.set('is_bookmark', true, { strict: false });

            if (coverUrlInfo) {
                pkg.cover_url = coverUrlInfo.baseUrl + pkg.id + coverUrlInfo.path;
            }
        });

        // count kols
        this.updateTotalInfluencer(packages.results);

        return packages;
    }

    /**
     * Get dashboard package information by id
     *
     * @param packageId Dashboard package object id
     *
     * @return {Package}
     */
    async getDashboardPackageById(packageId: string, coverUrlInfo?: any) {
        let pkg = await this._packageModel.findOne({ _id: packageId, show_dashboard: true });

        if (!pkg) throw new NotFound('PACKAGE_NOT_FOUND');

        return this._packageService.findById(packageId, coverUrlInfo, true);
    }

    /**
     * Get all ongoing job of brand
     *
     * @param brandId Brand object id
     *
     * @return {Object} All ongoing jobs
     */
    async getOngoingJobs(brandId: string, conditions?: any, coverUrlInfo?: any) {
        let brand = await this._brandModel.findById(brandId);

        if (!brand) throw new Forbidden('FORBIDDEN');

        // hook function for custom filter
        let addCustomFilter = function(query: any) {
            query.conditions['status'] = 2;
            query.conditions['assign_brand'] = brandId;
        };

        conditions.fields = 'title,description,type,time,kol_jobs,status,kpi';

        let jobs = await this._jobModel.findWithFilter(
            conditions,
            SearchField,
            {
                beforeQuery: addCustomFilter
            },
            { path: 'kol_jobs' }
        );

        jobs.results.forEach(job => {
            job.set('stats', this._jobService.aggregateOngoingJobSimple(job.kol_jobs), { strict: false });

            job.set('start_date', job.time[0].time, { strict: false });
            job.set('end_date', job.time.pop().time, { strict: false });

            job.set('kol_jobs', undefined, { strict: false });
            job.set('time', undefined, { strict: false });

            if (coverUrlInfo)
                job.set('cover_url', coverUrlInfo.baseUrl + job.id + coverUrlInfo.path, { strict: false });
        });

        return jobs;
    }

    /**
     * Get all completed job of brand
     *
     * @param brandId Brand object id
     *
     * @return {Object} All completed jobs
     */
    async getCompletedJobs(brandId: string, conditions?: any, coverUrlInfo?: any) {
        let brand = await this._brandModel.findById(brandId);

        if (!brand) throw new Forbidden('FORBIDDEN');

        // hook function for custom filter
        let addCustomFilter = function(query: any) {
            query.conditions['status'] = 3;
            query.conditions['assign_brand'] = brandId;
        };

        conditions.fields = 'title,description,type,time,kol_jobs,status,kpi';

        let jobs = await this._jobModel.findWithFilter(
            conditions,
            SearchField,
            {
                beforeQuery: addCustomFilter
            },
            { path: 'kol_jobs' }
        );

        jobs.results.forEach(job => {
            job.set('stats', this._jobService.aggregateJob(job.kol_jobs), { strict: false });

            job.set('start_date', job.time[0].time, { strict: false });
            job.set('end_date', job.time.pop().time, { strict: false });

            job.set('kol_jobs', undefined, { strict: false });
            job.set('time', undefined, { strict: false });

            if (coverUrlInfo)
                job.set('cover_url', coverUrlInfo.baseUrl + job.id + coverUrlInfo.path, { strict: false });
        });

        return jobs;
    }

    /**
     * Get job info
     *
     * @param brandId Brand objectId
     * @param jobId Job objectId
     *
     * @return {Job} Job info
     */
    async getJobById(brandId: string, jobId: string, coverUrlInfo?: any) {
        let brand = await this._brandModel.findById(brandId);

        if (!brand) throw new Forbidden('FORBIDDEN');

        let job = await this._jobModel
            .findOne({ _id: jobId, assign_brand: brandId })
            .select('status kol_jobs title description type time groups groups_reference kpi');

        if (!job) throw new NotFound('JOB_NOT_FOUND');

        // populate data
        await job
            .populate({
                path: 'kol_jobs',
                select: 'engagement post status time kol_id',
                populate: {
                    path: 'kol_id',
                    select: 'facebook.name facebook.entity_id facebook.analytic.total_follower'
                }
            })

            .populate({ path: 'groups' })
            .populate({ path: 'groups_reference', select: 'name groups' })
            .execPopulate();

        await this._packageService.populateGroup(job);

        // populate groups stats
        job.set('groups_stats', this._packageService.aggregateGroups(job.groups, 0), { strict: false });

        if (job.groups_reference && job.groups_reference['groups']) {
            job.groups_reference['set']('is_groups_modified', this.isGroupsModified(job), { strict: false });
            job.groups_reference['set']('groups', undefined, { strict: false });
        }

        job.set('groups', undefined);

        // calculate stats
        job.set('stats', this._jobService.aggregateJob(job.kol_jobs), { strict: false });

        if (coverUrlInfo) job.set('cover_url', coverUrlInfo.baseUrl + job.id + coverUrlInfo.path, { strict: false });

        return job;
    }

    /**
     * Get state of reference package
     *
     * @param jobGroups Kol Groups from job
     * @param pkgGroups Kol Groups from reference package
     *
     * @return {boolean} Two groups equality
     */
    isGroupsModified(job: Job) {
        let result = false;

        try {
            let jobGroups = job.groups;
            let pkgGroups = job.groups_reference['groups'];

            pkgGroups.forEach((group, index) => {
                if (JSON.stringify(jobGroups[index].kols) !== JSON.stringify(pkgGroups[index].kols)) result = true;
            });
        } catch {
            result = true;
        }

        return result;
    }
}
