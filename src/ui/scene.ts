namespace cui {
    export class Scene extends cval.Entity {
        baseView: View;
        viewMutexs: { [viewMutex: string]: View };
        viewList: { [layer: number]: View[] };
        container: cval.EntityContainer;
        display: eui.Group;


        _removeViewList: View[];
        _addViewList: View[];

        tailZOrder: number;

        mask: eui.Rect;

        maskView: View;
        private _topView: View;
        topViewName: string;
        constructor(baseView) {
            super();
            this.baseView = baseView;

            this.mask = new eui.Rect();
            this.mask.alpha = 0.6;
            this.tailZOrder = 0;
            this.viewList = {};
            this.viewMutexs = {};
            this.display = new eui.Group();
            this._addViewList = [];
            this._removeViewList = [];

            this.pushView(this.baseView);

            this.container = new cval.EntityContainer();

        }
        onCreate() {
            this.mask.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTabOutSideClose, this);
            this.onResize();
        }
        onDestroy() {
            super.destroy();
            this.mask.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTabOutSideClose, this);
        }
        onResize() {
            let width = director.instance.rootLayer.width;
            let height = director.instance.rootLayer.height
            this.display.width = width;
            this.display.height = height;
            this.mask.width = width;
            this.mask.height = height;
        }

        pushView(view: View) {
            this._addViewList.push(view);
        }

        popView(view: View) {
            this._removeViewList.push(view);
        }

        getLayerViewList(layer) {
            this.viewList[layer] = this.viewList[layer] || [];
            return this.viewList[layer];
        }

        onUpdateView() {
            for (let layer in this.viewList) {
                let viewList = this.viewList[layer];
                for (let i = 0, len = viewList.length; i < len; i++) {
                    let view = viewList[i];
                    view.onUpdate()
                }
            }
            for (let i = 0, len = this._removeViewList.length; i < len; i++) {
                let view = this._removeViewList[i];
                if (view.mutex) {
                    if (this.viewMutexs[view.mutex] == view) {
                        delete this.viewMutexs[view.mutex];
                    }
                }
                let viewList = this.getLayerViewList(view.layer);
                let index = viewList.indexOf(view);
                if (index != -1) {
                    viewList.splice(index, 1);
                    view.close();
                }
            }
            this._removeViewList.length = 0;
            for (let i = 0, len = this._addViewList.length; i < len; i++) {
                let view = this._addViewList[i];
                let viewList = this.getLayerViewList(view.layer);
                let index = viewList.indexOf(view);
                if (index == -1) {
                    viewList.push(view);
                    view.zOrder = this.tailZOrder++;
                    view.scene = this;
                }
                this.display.addChild(view);
            }
            this._addViewList.length = 0;
            this.display.contains(this.mask) && this.display.removeChild(this.mask);
            let children = this.display.$children;
            children.sort(this.compareChildren);
            let maskIndex = -1;
            this.maskView = null;
            for (let len = children.length; len > 0; len--) {
                let view = <View>children[len - 1];
                if (view.viewConfig.mask) {
                    maskIndex = len - 1;
                    this.maskView = view;
                }
            }
            for (let len = children.length; len > 0; len--) {
                let view = <View>children[len - 1];
                if (!view.viewConfig.fixed) {
                    this.topView = view;
                    break;
                }
            }
            if (maskIndex > -1) {
                this.display.addChildAt(this.mask, maskIndex);
            }
        }

        onUpdate() {
            this.container.onUpdate();
            this.onUpdateView();

        }
        compareChildren(a: View, b: View) {
            if (a.layer == b.layer) {
                return a.zOrder - b.zOrder;
            }
            return a.layer - b.layer;
        }

        onTabOutSideClose() {
            if (this.topView == this.maskView && this.maskView.viewConfig.tabOutSideClose) {
                this.popView(this.topView);
            }
        }
        get topView(): View {
            return this._topView;
        }
        set topView(view: View) {
            if (this._topView != view) {
                this._topView = view;
                this.topViewName = this._topView['__class__'];
            }
        }
    }
}