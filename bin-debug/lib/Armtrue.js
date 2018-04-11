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
var clib;
(function (clib) {
    var dbFactory = new dragonBones.EgretFactory();
    function loadArmtrueRes(name, callBack, thisObject) {
        if (dbFactory.getDragonBonesData(name) && dbFactory.getTextureAtlasData(name)) {
            callBack && callBack.call(thisObject);
        }
        var sk, tx, tj;
        var skName = name + '_ske_json';
        var tjName = name + '_tex_json';
        var txName = name + '_tex_png';
        egret.assert(RES.hasRes(skName), "loadArmatureRes: skeleton not found(" + skName + ")");
        egret.assert(RES.hasRes(tjName), "loadArmatureRes: spritesheet not found(" + tjName + ")");
        egret.assert(RES.hasRes(txName), "loadArmatureRes: texture not found(" + txName + ")");
        var loadRes = function () {
            if (sk && tx && tj) {
                if (dbFactory.getDragonBonesData(name)) {
                    dbFactory.removeDragonBonesData(name);
                }
                dbFactory.parseDragonBonesData(sk);
                if (dbFactory.getTextureAtlasData(name)) {
                    dbFactory.removeTextureAtlasData(name);
                }
                dbFactory.parseTextureAtlasData(tj, tx);
                egret.log('load armature: ' + name);
                callBack && callBack.call(thisObject);
            }
        };
        RES.getResAsync(skName, function (data) {
            var sk = data;
            loadRes();
        }, null);
        RES.getResAsync(tjName, function (data) {
            var tj = data;
            loadRes();
        }, null);
        RES.getResAsync(txName, function (data) {
            var tx = data;
            loadRes();
        }, null);
    }
    clib.loadArmtrueRes = loadArmtrueRes;
    var Armtrue = (function (_super) {
        __extends(Armtrue, _super);
        function Armtrue() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Armtrue;
    }(eui.Component));
    clib.Armtrue = Armtrue;
    __reflect(Armtrue.prototype, "clib.Armtrue");
})(clib || (clib = {}));
//# sourceMappingURL=Armtrue.js.map