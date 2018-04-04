var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// TypeScript file
var cui;
(function (cui) {
    cui.layer = {
        /**最底层baseView那一层 */
        base: 0,
        /**界面层 */
        panel: 10,
        /**弹出提示框的层 */
        dialog: 30,
    };
    var View = (function (_super) {
        __extends(View, _super);
        function View(config) {
            var _this = _super.call(this) || this;
            _this._byCreate = [];
            _this._byDestroy = [];
            _this.setViewConfig(config);
            _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this._onCreate, _this);
            _this.addEventListener(egret.Event.REMOVED_FROM_STAGE, _this._onDestroy, _this);
            _this.horizontalCenter = 0;
            _this.verticalCenter = 0;
            return _this;
        }
        View.prototype.setViewConfig = function (config) {
            this.viewConfig = config;
            if (this.viewConfig.skin)
                this.skinName = this.viewConfig.skin;
        };
        //创建部分
        View.prototype._onCreate = function () {
            this.onCreate();
            for (var i = 0, len = this._byCreate.length; i < len; i++) {
                this._byCreate[i]();
            }
            this._byCreate.length = 0;
        };
        View.prototype.byCreate = function (createFunc) {
            this._byCreate.push(createFunc);
        };
        /**移除部分 */
        View.prototype._onDestroy = function () {
            this.onDestroy();
            for (var i = 0, len = this._byDestroy.length; i < len; i++) {
                this._byDestroy[i]();
            }
            this._byDestroy.length = 0;
        };
        Object.defineProperty(View.prototype, "pause", {
            get: function () {
                return this._pause;
            },
            set: function (state) {
                this._pause = state;
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.onUpdate = function () {
        };
        Object.defineProperty(View.prototype, "layer", {
            get: function () {
                if (this.viewConfig)
                    return this.viewConfig.layer;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "mutex", {
            get: function () {
                if (this.viewConfig)
                    return this.viewConfig.mutex;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "zOrder", {
            get: function () {
                return this._zOrder;
            },
            set: function (z) {
                this._zOrder = z;
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.close = function () {
            this.pause = true;
            this.parent && this.parent.removeChild(this);
            this.scene = null;
        };
        return View;
    }(eui.Component));
    cui.View = View;
    __reflect(View.prototype, "cui.View");
})(cui || (cui = {}));
//# sourceMappingURL=View.js.map