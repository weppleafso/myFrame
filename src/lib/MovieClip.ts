// TypeScript file
namespace clib {
    var mcFactoryDict: { [fname: string]: egret.MovieClipDataFactory } = {};
    /**加载movieClip资源 */
    export function loadMovieClipRes(fname: string, callBack: Function, thisObject: any) {
        if (mcFactoryDict[fname]) {
            return callBack.call(thisObject, fname);
        }
        let json, png;
        let loadRes = function () {
            if (json && png) {
                mcFactoryDict[fname] = new egret.MovieClipDataFactory(json, png);
                callBack.call(thisObject, fname);
            }
        }
        let fname_json = fname + "_json";
        let fname_png = fname + "_png";
        egret.assert(RES.hasRes(fname_json), 'loadMoiveClipRes: json not found(' + fname_json + ')');
        egret.assert(RES.hasRes(fname_png), 'loadMoiveClipRes: png not found(' + fname_png + ')');
        RES.getResAsync(fname_json, function (data) {
            json = data;
            loadRes();
        }, null);
        RES.getResAsync(fname_png, function (data) {
            png = data;
            loadRes();
        }, null);
    }

    function isMovieClipSetup(fname: string) {
        return !!mcFactoryDict[fname];
    }
    export class MovieClip extends egret.DisplayObjectContainer {
        private __fname: string;
        private __name: string;

        private _scaleX: number;
        private _scaleY: number;
        private _timeScale: number;
        private _pauseCount: number;
        private _loop: number;
        private _byAnimComplete: CallbackList;
        private _onceAnimCompleteCl: CallbackList;
        private _byLoopComplete: CallbackList;
        private _autoRemove: boolean;



        display: egret.MovieClip;
        /**
         * @param {string} fname 文件名
         * @param {string} name 需要播放的帧动画的名字，如果没有时跟
         * @param {number} loop 循环播放的次数
         * @param {boolean} autoRemove 播放完成后自动移除
         */
        constructor(fname: string, name?: string, loop: number = -1, autoRemove: boolean = false) {
            super();


            this._scaleX = 1;
            this._scaleY = 1;
            this._timeScale = 1;
            this._pauseCount = 0;
            this._loop = loop;
            this._autoRemove = autoRemove;
            this.setAnim(fname, name);
        }

        public setAnim(fname: string, name?: string) {
            if (this.__fname != fname || this.name != name) {
                this.__fname = fname;
                this.name = this.__name || this.__fname;
                loadMovieClipRes(fname, this.onMovieClipLoad, this);
            }
        }
        /**设置是否自动移除 */
        set autoRemove(val: boolean) {
            this._autoRemove = val;
        }

        get autoRemove(): boolean {
            return this._autoRemove;
        }
        /**设置播放速率 */
        set timeScale(scale: number) {
            this._timeScale = scale;
            if (this.display) {
                this.display.frameRate = this.display.movieClipData.frameRate * this._timeScale;
            }
        }

        get timeScale(): number {
            return this._timeScale;
        }




        private onMovieClipLoad(fname: string, name: string) {
            // 之所以还要判断一次isMovieClipSetup是为了防止，加载中途切换的动画。
            if (isMovieClipSetup(this.__fname) && this.__fname == fname && this.__name == name) {
                this.clearDisplay();
                this.display = this.getMovieClip(this.__fname, this.__name);
                this.addChildAt(this.display, 0);
                this.display.scaleX = this._scaleX;
                this.display.scaleY = this._scaleY;
                this.display.frameRate = this.display.movieClipData.frameRate * this._timeScale;
                this.setupAllListener();
                if (this._pauseCount <= 0) {
                    this.display.gotoAndPlay(0, this._loop);
                }
                egret.callLater(() => {
                    this.dispatchEventWith(egret.Event.COMPLETE);
                }, this);
            }
        }

        /** 动画完成播放时回调*/
        byAnimComplete(call: Function, thisObject?: any) {
            if (this._byAnimComplete == null) {
                this._byAnimComplete = new CallbackList();
            }
            this._byAnimComplete.push(call, thisObject);
        }


        onceAnimComplete(cb: Function, thisObject?: any) {
            if (this._onceAnimCompleteCl == null) {
                this._onceAnimCompleteCl = new CallbackList();
            }
            this._onceAnimCompleteCl.push(cb, thisObject);
        }

        /**一次循环完成时回调*/
        byLoopComplete(call: Function, thisObject?: any) {
            if (this._byLoopComplete == null) {
                this._byLoopComplete = new CallbackList();
            }
            this._byLoopComplete.push(call, thisObject);
            // 设置动画监听
            if (this.display && !this.display.hasEventListener(egret.MovieClipEvent.LOOP_COMPLETE)) {
                this.display.addEventListener(egret.MovieClipEvent.LOOP_COMPLETE, this.onLoopComplete, this);
            }
        }
        onAnimComplete() {
            if (this._onceAnimCompleteCl) {
                this._onceAnimCompleteCl.invoke(true);
            }
            if (this._byAnimComplete) {
                this._byAnimComplete.invoke(false);
            }
            if (this._autoRemove && this.parent) {
                this.parent.removeChild(this);
            }
        }
        onLoopComplete() {
            if (this._byLoopComplete) {
                this._byLoopComplete.invoke(false);
            }
        }

        /**移除所有监听 */
        removeAllListeners() {
            if (this._byAnimComplete) {
                this._byAnimComplete.clear();
            }
            if (this._byLoopComplete) {
                this._byLoopComplete.clear();
            }
            if (this._onceAnimCompleteCl) {
                this._onceAnimCompleteCl.clear();
            }

            if (!this.display) return;
            this.display.removeEventListener(egret.MovieClipEvent.COMPLETE, this.onAnimComplete, this);
            if (this.display.hasEventListener(egret.MovieClipEvent.LOOP_COMPLETE)) {
                this.display.removeEventListener(egret.MovieClipEvent.LOOP_COMPLETE, this.onLoopComplete, this);
            }
        }
        //根据情况监听消息
        setupAllListener() {
            if (!this.display) return;
            if (!this.display.hasEventListener(egret.MovieClipEvent.COMPLETE)) {
                this.display.addEventListener(egret.MovieClipEvent.COMPLETE, this.onAnimComplete, this);
            }
            if (this._byLoopComplete && !this.display.hasEventListener(egret.MovieClipEvent.LOOP_COMPLETE)) {
                this.display.addEventListener(egret.MovieClipEvent.LOOP_COMPLETE, this.onLoopComplete, this);
            }
        }

        private clearDisplay() {
            if (this.display) {
                this.display.parent && this.display.parent.removeChild(this.display);
            }
            this.display = null;

        }
        /**fname为文件名 name为要播放的动画名 todo 需要修改为缓存模式*/
        private getMovieClip(fname: string, name: string) {
            return new egret.MovieClip(mcFactoryDict[fname].generateMovieClipData(name))
        }

        /**
        * 设置播放（不能恢复暂停） 
        * @param frame {number} 从第几帧开始（-1表示继续当前帧）
        * @param loop {number} 播放次数（-1表示无限循环）
        */
        play(frame = -1, loop = -1) {
            this._loop = loop;
            if (this.display && !this._pauseCount) {
                if (frame >= 0) {
                    this.display.gotoAndPlay(frame, this._loop);
                }
                else {
                    this.display.play(this._loop);
                }
            }
        }

        /** 暂停当前动作 */
        pause() {
            this._pauseCount++;
            if (this._pauseCount == 1 && this.display) {
                this.display.stop();
            }
        }

        /** 恢复当前动作 */
        resume() {
            if (this._pauseCount > 0) {
                this._pauseCount--;
                if (this._pauseCount == 0 && this.display) {
                    this.display.play();
                }
            }
        }
    }
}