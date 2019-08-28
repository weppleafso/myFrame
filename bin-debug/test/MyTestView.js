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
var ctest;
(function (ctest) {
    var MyTestView = (function (_super) {
        __extends(MyTestView, _super);
        function MyTestView() {
            return _super.call(this, {
                layer: cui.layer.base,
                mask: true,
                skin: "MyTestView"
            }) || this;
        }
        MyTestView.prototype.createChildren = function () {
            _super.prototype.createChildren.call(this);
        };
        MyTestView.prototype.onChangeMusic = function () {
            var renderTextrue = new egret.RenderTexture();
            renderTextrue.drawToTexture(this.imgBg);
            renderTextrue.toDataURL("image/png");
            return;
            var list = ["homepage_bgm_mp3", "comic_bgm_mp3"];
            var i = Math.floor(Math.random() * list.length);
            var res = list[i];
            clib.sound.playMusic(res, true);
        };
        MyTestView.prototype.onChangeEffect = function () {
            var list = ["box_push_mp3", "click_mp3", "code_error_mp3"];
            var i = Math.floor(Math.random() * list.length);
            var res = list[i];
            clib.sound.playEffect(res, true);
        };
        MyTestView.prototype.onCreate = function () {
            this.shape = new egret.Shape();
            this.addChildAt(this.shape, 0);
            clib.sound.playMusic("comic_bgm_mp3", true);
            this.gpMap.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
            this.btnMusic.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onChangeMusic, this);
            this.btnEffect.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onChangeEffect, this);
            // this.addChild(new clib.MovieClip("bird"));
            var display = new battle.TestActor();
            var test = new battle.Actor();
            test.display = display;
            this.addChild(display);
            director.instance.container.addEntity(test);
            this.testActor = test;
            this.pathFinder = new battle.PathFinder();
            this.pathFinder.init();
            this.pathFinder.drawRect(this.shape);
            // clib.useCache(battle.TestActor,function(obj:battle.TestActor,a:number){
            //     console.log(a);
            // })
            var par = new particle.GravityParticleSystem(RES.getRes("newParticle_png"), RES.getRes("newParticle_json"));
            par.start();
            this.addChild(par);
            // par.changeTexture(RES.getRes("treeParticle_png"))
            par.x = director.instance.width / 2;
            par.y = director.instance.height / 2;
        };
        MyTestView.prototype.onDestroy = function () {
        };
        MyTestView.prototype.onTap = function (e) {
            var target = new Vec2(e.localX, e.localY);
            var ret = this.pathFinder.calculatePath(this.testActor.pos, target);
            this.testActor.onMoveTo(ret);
        };
        return MyTestView;
    }(cui.View));
    ctest.MyTestView = MyTestView;
    __reflect(MyTestView.prototype, "ctest.MyTestView");
})(ctest || (ctest = {}));
