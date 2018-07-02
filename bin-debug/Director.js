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
            this._stage.orientation = config.orientation;
            this._stage.scaleMode = config.scaleMode;
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
            // clib.netWork.connect("127.0.0.1", 3010, (success: boolean) => {
            //     if (success) {
            //         console.log("aaaa", success);
            //         clib.netWork.request("connector.entryHandler.entry", { nickName: "haha", rid: 1 }, (res) => {
            //         });
            //     }
            // }, this);
            this._stage.addEventListener(egret.Event.ENTER_FRAME, this.onTick, this);
        };
        Director.prototype.onTick = function () {
            var nowDt = egret.getTimer();
            var dt = nowDt - this.lastTick;
            this.lastTick = nowDt;
            this.tickMs = Math.min(dt, 100);
            this.tickSec = this.tickMs / 1000;
            this.onUpdate();
        };
        Director.prototype._onResize = function () {
            var contentHeight = config.GAME_CONTENT_HEIGHT;
            var contentWidth = config.GAME_CONTENT_WIDTH;
            var realHeight = this._stage.stageHeight;
            if (realHeight < contentHeight) {
                this._uiScale = realHeight / contentHeight;
            }
            else {
                this._uiScale = 1;
            }
            // init fit design
            var designWidthScale = 1;
            var designHeightScale = 1;
            this._uiFitDesign = Math.min(designWidthScale, designHeightScale);
            this.rootLayer.width = this.width;
            this.rootLayer.height = this.height;
            this.floatLayer.width = this.width;
            this.floatLayer.height = this.height;
            this.topLayer.width = this.width;
            this.topLayer.height = this.height;
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
            dragonBones.WorldClock.clock.advanceTime(this.tickSec);
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
        Object.defineProperty(Director.prototype, "width", {
            get: function () {
                return this._stage.stageWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Director.prototype, "height", {
            get: function () {
                return this._stage.stageHeight;
            },
            enumerable: true,
            configurable: true
        });
        return Director;
    }());
    __reflect(Director.prototype, "Director");
    director.instance = new Director();
})(director || (director = {}));
//# sourceMappingURL=Director.js.map