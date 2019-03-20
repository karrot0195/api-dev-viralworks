declare namespace Express {
    export interface Request {
        auth: any;
        routePath: string;
    }
}