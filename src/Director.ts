namespace director {
    class Director {
        container: cval.EntityContainer;
        scene: cui.Scene;
        rootLayer: egret.DisplayObjectContainer;
        floatLayer: egret.DisplayObjectContainer;
        topLayer: egret.DisplayObjectContainer;

        _root: eui.UILayer;
        _stage: egret.Stage;

        tickMs: number;
        tickSec: number;
        lastTick: number;

        _uiScale: number;
        _uiFitDesign: number;
        constructor() {

        }
        init(root: eui.UILayer) {
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

            clib.sound = new clib.SoundManager(false);
            clib.sound.init();

            this._stage.addEventListener(egret.Event.ENTER_FRAME, this.onTick, this);
        }
        private onTick() {
            let nowDt = egret.getTimer()
            let dt = nowDt - this.lastTick;
            this.lastTick = nowDt;
            this.tickMs = Math.min(dt, 100);
            this.tickSec = this.tickMs / 1000;


            this.onUpdate();
        }
        private _onResize() {
            let contentHeight = config.GAME_CONTENT_HEIGHT;
            let contentWidth = config.GAME_CONTENT_WIDTH;
            let realHeight = this._stage.stageHeight;
            if (realHeight < contentHeight) {
                this._uiScale = realHeight / contentHeight;
            }
            else {
                this._uiScale = 1;
            }
            // init fit design
            let designWidthScale = 1;
            let designHeightScale = 1;
            this._uiFitDesign = Math.min(designWidthScale, designHeightScale);
            this.rootLayer.width = this.width;
            this.rootLayer.height = this.height;
            this.floatLayer.width = this.width;
            this.floatLayer.height = this.height;
            this.topLayer.width = this.width;
            this.topLayer.height = this.height;

            this.scene && this.scene.onResize();
        }
        dispose() {
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

        }
        private onUpdate() {
            dragonBones.WorldClock.clock.advanceTime(this.tickSec);
            this.container.onUpdate();
            this.scene && this.scene.onUpdate();
        }
        /**切换场景 返回上一个的场景 以便做频繁切换场景使用*/
        changeScene(scene: cui.Scene): cui.Scene {
            let lastScene = this.scene;
            lastScene && lastScene.destroy();
            this.rootLayer.removeChildren();
            this.scene = scene;
            scene.create();
            this.rootLayer.addChild(scene.display);
            return lastScene;
        }
        get width() {
            return this._stage.stageWidth;
        }
        get height() {
            return this._stage.stageHeight;
        }
    }
    export var instance: Director = new Director();
}