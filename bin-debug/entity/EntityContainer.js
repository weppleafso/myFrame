var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
// TypeScript file
var cval;
(function (cval) {
    var EntityContainer = (function () {
        function EntityContainer() {
            this._entityList = [];
        }
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
            var _this = this;
            if (!entity.manager) {
                return egret.warn("没有manager");
            }
            var index = this._entityList.indexOf(entity);
            if (index != -1) {
                entity.pause = false;
                entity.destroy();
                egret.callLater(function () {
                    _this._entityList.splice(index, 1);
                    entity.manager = null;
                }, this);
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
    }());
    cval.EntityContainer = EntityContainer;
    __reflect(EntityContainer.prototype, "cval.EntityContainer");
})(cval || (cval = {}));
//# sourceMappingURL=EntityContainer.js.map