import { Injectable } from "System/Injectable";
import { Cache } from "./Classes/Cache";
import { FacebookCache } from "./Classes/FacebookCache";

@Injectable
export class CacheBuilder {
    static cacheBuilder: CacheBuilder;
    private mapping: Array<Cache> = [];
    constructor() {
        this.register(new Cache());
        this.register(new FacebookCache());
    }

    static getInstance() {
        if (!this.cacheBuilder) this.cacheBuilder = new CacheBuilder();
        return this.cacheBuilder;
    }

    private register(cacheService: Cache) {
        this.mapping.push(cacheService);
    }

    public build(type: string):Cache {
        const service = <Cache>this.mapping.find(serivce => serivce.getName() == type);
        if (service) {
            service.hookBuild();
            return service;
        }
        this.mapping[0].hookBuild();
        return this.mapping[0];
    }
}