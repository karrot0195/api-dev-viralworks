import { Injectable } from 'System/Injectable';
import { IRoute, IRouter } from 'System/Interface';
import { HTTP } from 'System/Enum';
import { AuthenticationMiddleware } from './Middleware/AuthenticationMiddleware';
import { PackageController } from './Controllers/PackageController';
import { MetadataController } from '../Metadata/Controllers/MetadataController';
import { GuestMiddleware } from './Middleware/GuestMiddleware';

@Injectable
export class Router implements IRouter {
    readonly routes: IRoute[];
    constructor(
        // Controller
        readonly packageController: PackageController,
        readonly metadataController: MetadataController,
        // Middleware
        readonly authenticationMiddleware: AuthenticationMiddleware,
        readonly guestMiddleware: GuestMiddleware
    ) {
        this.routes = [
            {
                middleware: [{ class: this.authenticationMiddleware }],
                group: [
                    { path: '/packages', method: HTTP.Post, handler: this.packageController.createPackage },
                    {
                        path: '/packages/temp-cover',
                        method: HTTP.Post,
                        handler: this.packageController.uploadTempCover
                    },

                    { path: '/packages/{id}', method: HTTP.Put, handler: this.packageController.updatePackageById },
                    { path: '/packages/{id}', method: HTTP.Delete, handler: this.packageController.deletePackageById },
                    { path: '/packages/{id}/cover', method: HTTP.Post, handler: this.packageController.uploadCover },
                    { path: '/packages/{id}/cover', method: HTTP.Get, handler: this.packageController.getPrivateCover },

                    { path: '/packages/', method: HTTP.Get, handler: this.packageController.getPackages },
                    { path: '/packages/{id}', method: HTTP.Get, handler: this.packageController.getPackageById },

                    { path: '/packages/{id}/groups', method: HTTP.Post, handler: this.packageController.createGroup },

                    {
                        path: '/packages/{id}/groups/kols/',
                        method: HTTP.Put,
                        handler: this.packageController.deleteKolFromPackage
                    },
                    {
                        path: '/packages/{id}/groups/{tag}',
                        method: HTTP.Put,
                        handler: this.packageController.updateGroupInfo
                    },
                    {
                        path: '/packages/{id}/groups/{tag}',
                        method: HTTP.Delete,
                        handler: this.packageController.deleteGroupByTag
                    },
                    {
                        path: '/packages/{id}/groups/{tag}/kols/',
                        method: HTTP.Put,
                        handler: this.packageController.insertKolsIntoGroupByTag
                    },
                    {
                        path: '/packages/{id}/groups',
                        method: HTTP.Get,
                        handler: this.packageController.getGroupsOfPackageById
                    }
                ]
            },
            {
                middleware: [{ class: this.guestMiddleware }],
                group: [
                    { path: '/public-packages', method: HTTP.Get, handler: this.packageController.getPublicPackages },
                    {
                        path: '/public-packages/{slug}',
                        method: HTTP.Get,
                        handler: this.packageController.getPublicPackagesBySlug
                    },
                    {
                        path: '/public-packages/{id}/cover',
                        method: HTTP.Get,
                        handler: this.packageController.getPublicCover
                    }
                ]
            }
        ];
    }
}
