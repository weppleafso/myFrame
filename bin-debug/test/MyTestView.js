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
var ctest;
(function (ctest) {
    var MyTestView = (function (_super) {
        __extends(MyTestView, _super);
        function MyTestView() {
            return _super.call(this, {
                layer: cui.layer.base,
                mask: true,
                skin: "skins.ButtonSkin"
            }) || this;
        }
        MyTestView.prototype.onCreate = function () {
        };
        MyTestView.prototype.onDestroy = function () {
        };
        return MyTestView;
    }(cui.View));
    ctest.MyTestView = MyTestView;
    __reflect(MyTestView.prototype, "ctest.MyTestView");
})(ctest || (ctest = {}));
//# sourceMappingURL=MyTestView.js.map