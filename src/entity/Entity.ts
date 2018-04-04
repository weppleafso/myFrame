// TypeScript file
namespace cval {
    /**实体类，用于描述 */
    export abstract class Entity {
        protected abstract onCreate();
        protected abstract onDestroy();
        private _dispatch: egret.EventDispatcher;
        manager: EntityContainer;
        private _byCreate: Function;
        private _byDesroy: Function;

        private _pause: boolean;

        public get pause() {
            return this._pause;
        }
        public set pause(state: boolean) {
            this._pause = state;
        }

        constructor() {
        }
        dispatchEventWith(type: string, bubbles?: boolean, data?: any, cancelable?: boolean) {
            this._getDispatch().dispatchEventWith(type, bubbles, data, cancelable);
        }
        addEventListener(type: string, listener: Function, thisObect: any, useCaptrue?: boolean, priority?: number) {
            this._getDispatch().addEventListener(type, listener, thisObect, useCaptrue, priority);
        }
        removeEventListener(type: string, listener: Function, thisObect: any, useCaptrue?: boolean) {
            this._getDispatch().removeEventListener(type, listener, thisObect, useCaptrue);
        }
        once(type: string, listener: Function, thisObect: any, useCaptrue?: boolean, priority?: number) {
            this._getDispatch().once(type, listener, thisObect, useCaptrue, priority);
        }
        private _getDispatch() {
            if (this._dispatch == null) {
                this._dispatch = new egret.EventDispatcher();
            }
            return this._dispatch;
        }
        public onUpdate() {
        };
        byCreate(handler: Function) {
            this._byCreate = handler;
        }
        byDestroy(handler: Function) {
            this._byDesroy = handler;
        }
        create() {
            this.onCreate();
            this._byCreate && this._byCreate();
        }
        destroy() {
            this.onDestroy();
            this._byDesroy && this._byDesroy();
        }
    }
}