var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
// TypeScript file
var cval;
(function (cval) {
    var EntityContainer = (function (_super) {
        __extends(EntityContainer, _super);
        function EntityContainer() {
            var _this = _super.call(this) || this;
            _this._entityList = [];
            return _this;
        }
        EntityContainer.prototype.onCreate = function () {
        };
        EntityContainer.prototype.onDestroy = function () {
            this.removeAllEntity();
            this._entityList.length = 0;
        };
        EntityContainer.prototype.addEntity = function (entity) {
            if (!entity.manager) {
                this._entityList.push(entity);
                entity.create();
                entity.manager = this;
                entity.pause = false;
            }
            else {
                egret.warn("已经有manager了");
            }
        };
        EntityContainer.prototype.removeEntity = function (entity) {
            if (!entity.manager) {
                return egret.warn("没有manager");
            }
            var index = this._entityList.indexOf(entity);
            if (index != -1) {
                entity.pause = false;
                entity.destroy();
                this._entityList.splice(index, 1);
                entity.manager = null;
            }
            else {
                egret.warn("移除错误");
            }
        };
        EntityContainer.prototype.removeAllEntity = function () {
            for (var i = 0, len = this._entityList.length; i < len; i++) {
                var entity = this._entityList[i];
                entity.pause = false;
                entity.destroy();
                entity.manager = null;
            }
            this._entityList.length = 0;
        };
        EntityContainer.prototype.onUpdate = function () {
            for (var i = 0, len = this._entityList.length; i < len; i++) {
                var entity = this._entityList[i];
                !entity.pause && entity.onUpdate();
            }
        };
        return EntityContainer;
    }(cval.Entity));
    cval.EntityContainer = EntityContainer;
    __reflect(EntityContainer.prototype, "cval.EntityContainer");
})(cval || (cval = {}));
