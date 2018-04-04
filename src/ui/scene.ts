namespace cui {
    export abstract class Scene extends cval.Entity {
        baseView: View;
        viewMap: { [viewMutex: string]: View };
        viewList: { [zOrder: number]: View[] };
        container: cval.EntityContainer;
        display: eui.Group;


        _removeViewList: View[];
        _addViewList: View[];
        constructor(baseView) {
            super();
            this.baseView = baseView;
        }
        create() {
            super.create();
            this.display = new eui.Group();
            director.instance.rootLayer.addChild(this.display);
            this.display.addChild(this.baseView);
            this.onResize();

        }
        destroy() {
            super.destroy();
            this.display.parent && director.instance.rootLayer.removeChild(this.display);
        }
        onResize() {
            this.display.width = director.instance.rootLayer.width;
            this.display.height = director.instance.rootLayer.height;
        }

        pushView(view: View) {
            this._addViewList.push(view);
        }

        popView(view: View) {
            this._removeViewList.push(view);
        }

        onUpdate(){
            
        }
    }
}