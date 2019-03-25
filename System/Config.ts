export abstract class Config {
    readonly env: string;
    readonly version: string;
    readonly jwt: {
        readonly key: string;
        readonly expire: string;
        readonly remember: string;
    }
    readonly server: {
        readonly host: string;
        readonly port: number;
        readonly public: {
            readonly host: string;
            readonly port: number;
        };
        readonly scheme: string;
    };
    readonly document: {
        readonly path: string;
        readonly enable: boolean;
    };
    readonly security: {
        readonly pepper: string;
        readonly RBAC: boolean;
    };
    readonly mongodb: {
        readonly host: string;
        readonly port: number;
        readonly username: string;
        readonly password: string;
        readonly database: string;
        readonly debug: boolean;
    };
}