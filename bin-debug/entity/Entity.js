var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
// TypeScript file
var cval;
(function (cval) {
    /**实体类，用于描述 */
    var Entity = (function () {
        function Entity() {
        }
        Object.defineProperty(Entity.prototype, "pause", {
            get: function () {
                return this._pause;
            },
            set: function (state) {
                this._pause = state;
            },
            enumerable: true,
            configurable: true
        });
        Entity.prototype.dispatchEventWith = function (type, bubbles, data, cancelable) {
            this._getDispatch().dispatchEventWith(type, bubbles, data, cancelable);
        };
        Entity.prototype.addEventListener = function (type, listener, thisObect, useCaptrue, priority) {
            this._getDispatch().addEventListener(type, listener, thisObect, useCaptrue, priority);
        };
        Entity.prototype.removeEventListener = function (type, listener, thisObect, useCaptrue) {
            this._getDispatch().removeEventListener(type, listener, thisObect, useCaptrue);
        };
        Entity.prototype.once = function (type, listener, thisObect, useCaptrue, priority) {
            this._getDispatch().once(type, listener, thisObect, useCaptrue, priority);
        };
        Entity.prototype._getDispatch = function () {
            if (this._dispatch == null) {
                this._dispatch = new egret.EventDispatcher();
            }
            return this._dispatch;
        };
        Entity.prototype.onUpdate = function () {
        };
        ;
        Entity.prototype.byCreate = function (handler) {
            this._byCreate = handler;
        };
        Entity.prototype.byDestroy = function (handler) {
            this._byDesroy = handler;
        };
        Entity.prototype.create = function () {
            this.onCreate();
            this._byCreate && this._byCreate();
        };
        Entity.prototype.destroy = function () {
            this.onDestroy();
            this._byDesroy && this._byDesroy();
        };
        return Entity;
    }());
    cval.Entity = Entity;
    __reflect(Entity.prototype, "cval.Entity");
})(cval || (cval = {}));
