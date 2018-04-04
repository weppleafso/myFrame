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
        lastTick:number;
        constructor() {

        }
        init(root: eui.UILayer) {
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

            this._stage.addEventListener(egret.Event.ENTER_FRAME,this.onTick,this);
        }
        private onTick() {
            let nowDt = egret.getTimer()
            let dt =  nowDt - this.lastTick;
            this.lastTick = nowDt;
            this.tickMs = Math.min(dt, 100);
            this.onUpdate();
        }
        private _onResize() {
            this.rootLayer.width = this._stage.width;
            this.rootLayer.height = this._stage.height;
            this.floatLayer.width = this._stage.width;
            this.floatLayer.height = this._stage.height;
            this.topLayer.width = this._stage.width;
            this.topLayer.height = this._stage.height;
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
            if(this._stage)
                this._stage.removeEventListener(egret.Event.ENTER_FRAME,this.onTick,this);

        }
        private onUpdate() {
            this.container.onUpdate();
            this.scene && this.scene.onUpdate();
        }
        /**切换场景 返回上一个的场景 以便做特殊处理使用*/
        changeScene(scene:cui.Scene):cui.Scene{
            let lastScene = this.scene;
            lastScene.destroy();
            this.scene = scene;
            scene.create();
            return lastScene;
        }
    }
    export var instance: Director = new Director();
}