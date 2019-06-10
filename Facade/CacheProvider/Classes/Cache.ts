import * as fs from 'fs';

export class Cache {
    private caches: Array<ICacheData>;
    constructor() { }

    public hookBuild() {
        if (!this.caches) {
            this.caches = this.getDataFromCacheFile();
        }
        this.filterCacheExpired();
    }

    public findCacheByKey(key: string) {
        return this.caches.find(c => c.key == key);
    }

    public getName() {
        return 'cache';
    }

    public pushCache(cache: ICacheData) {
        const c = this.caches.find(c => c.key == cache.key);
        if (c) {
            c.data = cache.data;
            c.expired = this.generateExpired();
        } else {
            cache.expired = this.generateExpired();
            this.caches.push(cache);
        }
        return this.saveCache();
    }

    public removeCache(key: string) {
        this.caches = this.caches.filter(c => c.key != key);
        return this.saveCache();
    }

    findCachesByBody(query: object) {
        return this.caches.filter(c => {
            let check = true;
            Object.keys(query).forEach(k => {
                if (c.data[k] != query[k]) {
                    check = false;
                }
            });
            return check;
        })
    }

    /* PRIVATE */
    private filterCacheExpired() {
        const count = this.caches.length;
        this.caches = this.caches.filter(c => c.key && c.expired && c.expired > (+new Date()));
        if (this.caches.length != count) {
            this.saveCache();
        }
    }

    private generateExpired(): number {
        return (+ new Date()) + this.getExpiredTime();
    }

    private getExpiredTime(): number {
        return <number>(process.env.CACHE_TIME || 1 * 60 * 60 * 1000);
    }

    private saveCache() {
        return this.setDataToCacheFile(this.caches);
    }

    private getDataFromCacheFile(): Array<ICacheData> {
        try {
            console.log(this.getPathCacheFile());
            const dataText = fs.readFileSync(this.getPathCacheFile(), 'utf-8');
            const data = JSON.parse(dataText);
            if (data) {
                return data;
            }
            return [];
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    private setDataToCacheFile(data: Array<ICacheData>) {
        try {
            fs.writeFileSync(this.getPathCacheFile(), JSON.stringify(data));
            return true;
        } catch (err) {
            return false;
        }
    }

    private getPathCacheFile(): string {
        return __dirname + '/../.cache/' + this.getName() + '.cache';
    }
}