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
            return _this;
        }
        Scene.prototype.create = function () {
            _super.prototype.create.call(this);
            this.display = new eui.Group();
            director.instance.rootLayer.addChild(this.display);
            this.display.addChild(this.baseView);
            this.onResize();
        };
        Scene.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.display.parent && director.instance.rootLayer.removeChild(this.display);
        };
        Scene.prototype.onResize = function () {
            this.display.width = director.instance.rootLayer.width;
            this.display.height = director.instance.rootLayer.height;
        };
        /**不允许在update中push 除非callLater*/
        Scene.prototype.pushView = function (view) {
        };
        /**不允许在update中remove 除非callLater*/
        Scene.prototype.poView = function (view) {
        };
        return Scene;
    }(cval.Entity));
    cui.Scene = Scene;
    __reflect(Scene.prototype, "cui.Scene");
})(cui || (cui = {}));
//# sourceMappingURL=scene.js.map