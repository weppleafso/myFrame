// TypeScript file
namespace cui {
    export var layer = {
        /**最底层baseView那一层 */
        base:0,
        /**界面层 */
        panel:10,
        /**弹出提示框的层 */
        dialog:30,
    }

    export interface ViewConfig{
        /**背景灰 默认为不显示*/
        mask?:boolean
        /**皮肤 */
        skin?:string
        /**zorder 默认的zOrder 为界面层*/
        layer?:number
        /**点击界面外关闭 默认为false*/
        tabOutSideClose?:boolean
        /**固定界面 意思就是组件 不计算为界面 默认为false*/
        fixed?:boolean
        /**互斥标记 同个标记的会关闭之前的 */
        mutex?:string
        /**组，同一组的界面是在同一层的时候不会隐藏之前的 */
        group?:string,
    }

    export abstract class View extends eui.Component{
        viewConfig:ViewConfig;
        _byCreate:Function[];
        _byDestroy:Function[];
        /**当前的scene */
        scene:Scene;
        constructor(config:ViewConfig){
            super();
            this._byCreate = [];
            this._byDestroy = [];
            this.setViewConfig(config);
            this.addEventListener(egret.Event.ADDED_TO_STAGE,this._onCreate,this);
            this.addEventListener(egret.Event.REMOVED_FROM_STAGE,this._onRemove,this);
            this.horizontalCenter = 0;
            this.verticalCenter = 0;
        }
        setViewConfig(config:ViewConfig){
            this.viewConfig = config;
            if(this.viewConfig.skin)this.skinName = this.viewConfig.skin;
        }

        //创建部分
        _onCreate(){
            this.onCreate();
            for(let i = 0,len = this._byCreate.length;i<len;i++){
                this._byCreate[i]();
            }
            this._byCreate.length = 0;
        }
        byCreate(createFunc:Function){
            this._byCreate.push(createFunc);
        }
        protected abstract onCreate();

        /**移除部分 */
        _onRemove(){
            this.onRemove();
            for(let i = 0,len = this._byDestroy.length;i<len;i++){
                this._byDestroy[i]();
            }
            this._byDestroy.length = 0;
        }
        protected abstract onRemove();

        /**界面动态逻辑部分 */
        private _pause:boolean;
        public get pause(){
            return this._pause;
        }
        public set pause(state:boolean){
            this._pause = state;
        }
        onUpdate(){

        }

        get layer(){
            if(this.viewConfig)  return this.viewConfig.layer;
        }

        get mutex(){
            if(this.viewConfig)  return this.viewConfig.mutex;
        }


        private _zOrder:number;
        get zOrder(){
            return this._zOrder;
        }
        set zOrder(z){
            this._zOrder = z;
        }

        close(){
            this.pause = true;
            this.parent && this.parent.removeChild(this);
            this.scene = null;
        }
    }
}