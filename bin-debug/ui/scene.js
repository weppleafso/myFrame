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
var cui;
(function (cui) {
    var Scene = (function (_super) {
        __extends(Scene, _super);
        function Scene(baseView) {
            var _this = _super.call(this) || this;
            _this.baseView = baseView;
            _this.mask = new eui.Rect();
            _this.mask.alpha = 0.6;
            _this.tailZOrder = 0;
            _this.viewList = {};
            _this.viewMutexs = {};
            _this.display = new eui.Group();
            _this._addViewList = [];
            _this._removeViewList = [];
            _this.pushView(_this.baseView);
            _this.container = new cval.EntityContainer();
            return _this;
        }
        Scene.prototype.onCreate = function () {
            this.mask.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTabOutSideClose, this);
            this.onResize();
        };
        Scene.prototype.onDestroy = function () {
            _super.prototype.destroy.call(this);
            this.mask.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTabOutSideClose, this);
        };
        Scene.prototype.onResize = function () {
            var width = director.instance.rootLayer.width;
            var height = director.instance.rootLayer.height;
            this.display.width = width;
            this.display.height = height;
            this.mask.width = width;
            this.mask.height = height;
        };
        Scene.prototype.pushView = function (view) {
            this._addViewList.push(view);
        };
        Scene.prototype.popView = function (view) {
            this._removeViewList.push(view);
        };
        Scene.prototype.getLayerViewList = function (layer) {
            this.viewList[layer] = this.viewList[layer] || [];
            return this.viewList[layer];
        };
        Scene.prototype.onUpdateView = function () {
            for (var layer_1 in this.viewList) {
                var viewList = this.viewList[layer_1];
                for (var i = 0, len = viewList.length; i < len; i++) {
                    var view = viewList[i];
                    view.onUpdate();
                }
            }
            for (var i = 0, len = this._removeViewList.length; i < len; i++) {
                var view = this._removeViewList[i];
                if (view.mutex) {
                    if (this.viewMutexs[view.mutex] == view) {
                        delete this.viewMutexs[view.mutex];
                    }
                }
                var viewList = this.getLayerViewList(view.layer);
                var index = viewList.indexOf(view);
                if (index != -1) {
                    viewList.splice(index, 1);
                    view.close();
                }
            }
            this._removeViewList.length = 0;
            for (var i = 0, len = this._addViewList.length; i < len; i++) {
                var view = this._addViewList[i];
                var viewList = this.getLayerViewList(view.layer);
                var index = viewList.indexOf(view);
                if (index == -1) {
                    viewList.push(view);
                    view.zOrder = this.tailZOrder++;
                    view.scene = this;
                }
                this.display.addChild(view);
            }
            this._addViewList.length = 0;
            this.display.contains(this.mask) && this.display.removeChild(this.mask);
            var children = this.display.$children;
            children.sort(this.compareChildren);
            var maskIndex = -1;
            this.maskView = null;
            for (var len = children.length; len > 0; len--) {
                var view = children[len - 1];
                if (view.viewConfig.mask) {
                    maskIndex = len - 1;
                    this.maskView = view;
                }
            }
            for (var len = children.length; len > 0; len--) {
                var view = children[len - 1];
                if (!view.viewConfig.fixed) {
                    this.topView = view;
                }
            }
            if (maskIndex > -1) {
                this.display.addChildAt(this.mask, maskIndex);
            }
        };
        Scene.prototype.onUpdate = function () {
            this.container.onUpdate();
            this.onUpdateView();
        };
        Scene.prototype.compareChildren = function (a, b) {
            if (a.layer == b.layer) {
                return a.zOrder - b.zOrder;
            }
            return a.layer - b.layer;
        };
        Scene.prototype.onTabOutSideClose = function () {
            if (this.topView == this.maskView && this.maskView.viewConfig.tabOutSideClose) {
                this.popView(this.topView);
            }
        };
        return Scene;
    }(cval.Entity));
    cui.Scene = Scene;
    __reflect(Scene.prototype, "cui.Scene");
})(cui || (cui = {}));
//# sourceMappingURL=scene.js.map