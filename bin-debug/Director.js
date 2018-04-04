var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var director;
(function (director) {
    var Director = (function () {
        function Director() {
        }
        Director.prototype.init = function (root) {
            this.dispose();
            this._root = root;
            this._stage = root.stage;
            this._stage.addEventListener(egret.Event.RESIZE, this._onResize, this);
            this.container = new cval.EntityContainer();
            this.rootLayer = new egret.DisplayObjectContainer();
            this.floatLayer = new egret.DisplayObjectContainer();
            this.topLayer = new egret.DisplayObjectContainer();
            this._root.addChild(this.rootLayer);
            this._root.addChild(this.floatLayer);
            this._root.addChild(this.topLayer);
            this._onResize();
            this.lastTick = egret.getTimer();
            this._stage.addEventListener(egret.Event.ENTER_FRAME, this.onTick, this);
        };
        Director.prototype.onTick = function () {
            var nowDt = egret.getTimer();
            var dt = nowDt - this.lastTick;
            this.lastTick = nowDt;
            this.tickMs = Math.min(dt, 100);
            this.onUpdate();
        };
        Director.prototype._onResize = function () {
            this.rootLayer.width = this._stage.width;
            this.rootLayer.height = this._stage.height;
            this.floatLayer.width = this._stage.width;
            this.floatLayer.height = this._stage.height;
            this.topLayer.width = this._stage.width;
            this.topLayer.height = this._stage.height;
            this.scene && this.scene.onResize();
        };
        Director.prototype.dispose = function () {
            if (this.scene) {
                this.scene.container.removeAllEntity();
            }
            this.scene = null;
            if (this.container) {
                this.container.removeAllEntity();
            }
            this.container = null;
            if (this._stage)
                this._stage.removeEventListener(egret.Event.ENTER_FRAME, this.onTick, this);
        };
        Director.prototype.onUpdate = function () {
            this.container.onUpdate();
            this.scene && this.scene.onUpdate();
        };
        /**切换场景 返回上一个的场景 以便做频繁切换场景使用*/
        Director.prototype.changeScene = function (scene) {
            var lastScene = this.scene;
            lastScene && lastScene.destroy();
            this.rootLayer.removeChildren();
            this.scene = scene;
            scene.create();
            this.rootLayer.addChild(scene.display);
            return lastScene;
        };
        return Director;
    }());
    __reflect(Director.prototype, "Director");
    director.instance = new Director();
})(director || (director = {}));
//# sourceMappingURL=Director.js.map