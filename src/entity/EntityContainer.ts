// TypeScript file
namespace cval{
    export class EntityContainer extends Entity{
        private _entityList:Entity[];
        constructor(){
            super();
            this._entityList = [];
        }
        onCreate(){
        }
        onDestroy(){
            this.removeAllEntity();
            this._entityList.length = 0;
        }
        addEntity(entity:Entity){
            if(!entity.manager){
                this._entityList.push(entity);
                entity.create();
                entity.manager = this;
                entity.pause = false;
            }
            else{
                egret.warn("已经有manager了")
            }
        }
        removeEntity(entity:Entity){
            if(!entity.manager){
                return egret.warn("没有manager");
            }
            let index = this._entityList.indexOf(entity);
            if(index != -1){
                entity.pause = false;
                entity.destroy();
                this._entityList.splice(index,1);
                entity.manager = null;
            }
            else{
                egret.warn("移除错误")
            }
        }
        removeAllEntity(){
            for(let i = 0,len = this._entityList.length;i<len;i++){
                let entity = this._entityList[i];
                entity.pause = false;
                entity.destroy();
                entity.manager = null;
            }
            this._entityList.length = 0;
        }
        onUpdate(){
            for(let i = 0,len = this._entityList.length;i<len;i++){
                let entity = this._entityList[i];
                !entity.pause && entity.onUpdate();
            }
        }
    }
}