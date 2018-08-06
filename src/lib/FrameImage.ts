namespace clib {
    export function loadFrameGroupRes(fname: string, callBack: Function) {
        let count = 0
        let length = 0;
        for (let i = 1; i <= 999; i++) {
            // let name = fname + "_" + cnUtils.toFixNum(i, 3, '0') + "_png";
            if (RES.hasRes(name)) {
                length++;
            }
            else {
                break;
            }
        }
        for (let i = 1; i <= length; i++) {
            // let name = fname + "_" + cnUtils.toFixNum(i, 3, '0') + "_png";
            RES.getResAsync(name, function (data) {
                count++;
                if (count >= length) {
                    callBack();;
                }
            }, this)
        }
        return length;
    }
    export class FrameImage extends eui.Image {
        private _fname: string;
        private length: number;
        private loop = 1;
        private callBack: Function;
        private _res: egret.Texture[];
        private _complete: boolean;
        private current = -1;
        private _playing: boolean;
        private _dt: number = 1000 / 24;
        private passTime: number;
        private _lastTime: number;

        constructor(fname: string) {
            super();
            this._fname = fname;
            this.length = 0;
            this._complete = false;
            this._playing = false;
        }
        protected createChildren() {
            super.createChildren();
            this.loadAllRes();
        }
        play(loop: number, callBack) {
            this.loop = loop;
            this.callBack = callBack;
            this._onBegin();
        }
        private _onBegin() {
            if (this._complete && !this._playing) {
                if (!this.hasEventListener(egret.Event.ENTER_FRAME)) {
                    this.addEventListener(egret.Event.ENTER_FRAME, this.onUpdate, this);
                    this._playing = true;
                    // this._lastTime = egret.getTimer();
                    this.passTime = 0;
                }
            }
        }
        private _onEnd() {
            this.texture = this._res[this.length - 1];
            this.removeEventListener(egret.Event.ENTER_FRAME, this.onUpdate, this);
            this.callBack && this.callBack();
            this._playing = false;
        }
        onUpdate() {
            let dt = director.instance.tickMs;
            this.passTime += dt;
            let frame = Math.floor(this.passTime / this._dt);
            this.current = frame % this.length;
            let loop = frame / this.length;
            this.texture = this._res[this.current];
            if (this.loop != -1 && this.loop <= loop) {
                this._onEnd();
            }
        }
        loadComplete() {
            this._res = [];
            for (let i = 1; i <= this.length; i++) {
                // let name = this._fname + "_" + cnUtils.toFixNum(i, 3, '0') + "_png";
                this._res.push(RES.getRes(name));
            }
            this._complete = true;
            egret.callLater(this._onBegin, this);
        }
        loadAllRes() {
            this.length = loadFrameGroupRes(this._fname, () => {
                this.loadComplete();
            })
        }
    }
}