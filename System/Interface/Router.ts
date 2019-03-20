import { IMiddleware } from './Middleware';
import { HTTP } from 'System/Enum';
import { IHandler } from './Controller';

export interface IRoute {
    readonly path?: string;
    readonly middleware?: IRouteMiddleware[];
    readonly group?: IRoute[];
    readonly method?: HTTP;
    readonly handler?: IHandler;
}

export interface IRouteModule {
    readonly path: string;
    readonly group: IRoute[];
    readonly version?: string;
    readonly description?: string;
    readonly host?: string;
    readonly port?: number;
}

export type IRouteMiddleware = { class: IMiddleware, params?: { [name: string]: string | object | number | boolean } };

export interface IRouter {
    readonly routes: IRoute[];
}

export interface IModuleRouter {
    readonly routes: { [module: string]: IRouteModule };
}