namespace clib {
    interface CacheObjBuilder {
        (initArgs: any[], ...args: any[]): any;
    }

    interface CacheResetFunction {
        (obj: any, ...args: any[]): void;
    }
    export class Cache {
        pool: any[];
        buildFunc: CacheObjBuilder;
        resetFunc: CacheResetFunction;
        classType: any;
        constructor(classType:any, buildFunc:CacheObjBuilder,resetFunc:CacheResetFunction) {
            this.pool = [];
            this.classType = classType;
            this.buildFunc = buildFunc;
            this.resetFunc = resetFunc;
        }
        recyle(obj: any) {
            this.pool.push(obj);
        }
        getObj(...param: any[]) {
            if (this.pool.length > 0) {
                let item = this.pool.pop();
                this.resetFunc(item);
                return item;
            }
            else {
                let item = new this.classType();
                this.resetFunc(item, ...param);
                return item;
            }
        }
        clear() {
            this.pool.length = 0;
        }
        destroy() {
            this.resetFunc = null;
            this.clear();
        }
    }
    export var cacheDict: { [name: string]: Cache } = {};
    export function useCache(classType, buildFunc:CacheObjBuilder,resetFunc:CacheResetFunction) {
        let name = classType.prototype.__class__;
        if (cacheDict[name] == null) {
            cacheDict[name] = new Cache(classType, buildFunc,resetFunc);
        }
    }
    export function recyleCacheObj(obj: any) {
        let name = obj['__class__'];
        if (cacheDict[name]) {
            cacheDict[name].recyle(obj);
        }
    }
    export function getCacheObj(classType, ...param: any[]) {
        let name = classType.prototype.__class__;
        if (cacheDict[name]) {
            return cacheDict[name].getObj(...param);
        }
    }
    export function clearAllCache() {
        for (let name in cacheDict) {
            cacheDict[name].destroy();
        }
        cacheDict = {};
    }

}