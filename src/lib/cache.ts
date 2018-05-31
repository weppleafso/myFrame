namespace clib{
    export class Cache {
        pool:any[];
        initFunc:Function;
        classType:any;
        constructor(classType,initFunc){
            this.pool = [];
            this.classType = classType;
            this.initFunc = initFunc;
        }
        recyle(obj:any){
            this.pool.push(obj);
        }
        getObj(...param:any[]){
            if(this.pool.length > 0){
                let item = this.pool.pop();
                this.initFunc(item);
                return item;
            }
            else{
                let item = new this.classType();
                this.initFunc(item,...param);
                return item;
            }
        }
        clear(){
            this.pool.length = 0;
        }
        destroy(){
            this.initFunc = null;
            this.clear();
        }
    }
    export var cacheDict: {[name:string]:Cache}= {};
    export function useCache(classType,initFunc:Function){
        let name = classType.prototype.__class__;
        if(cacheDict[name] == null){
            cacheDict[name] = new Cache(classType,initFunc);
        }
    }
    export function recyleCacheObj(obj:any){
        let name = obj['__class__'];
        if(cacheDict[name]){
            cacheDict[name].recyle(obj);
        }
    }
    export function getCacheObj(classType,...param:any[]){
        let name = classType.prototype.__class__;
        if(cacheDict[name]){
            return cacheDict[name].getObj(...param);
        }
    }
    export function clearAllCache(){
        for(let name in cacheDict){
            cacheDict[name].destroy();
        }
        cacheDict = {};
    }

}