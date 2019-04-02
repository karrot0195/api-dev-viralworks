import { HTTP } from '../Enum';

export interface IPermission {
    readonly route: {
        readonly path: string;
        readonly method: HTTP;
    };
    readonly description?: string;
    readonly roles?: string[];
}

export interface IRole {
    readonly name: string;
    readonly description?: string;
    readonly parentId?: string;
    readonly permissions?: string[];
}

export interface IRoutePath {
    readonly path: string;
    readonly method: HTTP;
    readonly description?: string;
}
