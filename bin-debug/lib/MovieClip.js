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
var clib;
(function (clib) {
    var mcFactoryDict = {};
    /**加载movieClip资源 */
    function loadMovieClipRes(fname, callBack, thisObject) {
        if (mcFactoryDict[fname]) {
            return callBack.call(thisObject, fname);
        }
        var json, png;
        var loadRes = function () {
            if (json && png) {
                mcFactoryDict[fname] = new egret.MovieClipDataFactory(json, png);
                callBack.call(thisObject, fname);
            }
        };
        var fname_json = fname + "_json";
        var fname_png = fname + "_png";
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
    clib.loadMovieClipRes = loadMovieClipRes;
    function isMovieClipSetup(fname) {
        return !!mcFactoryDict[fname];
    }
    var MovieClip = (function (_super) {
        __extends(MovieClip, _super);
        /**
         * @param {string} fname 文件名
         * @param {string} name 需要播放的帧动画的名字，如果没有时跟
         * @param {number} loop 循环播放的次数
         * @param {boolean} autoRemove 播放完成后自动移除
         */
        function MovieClip(fname, name, loop, autoRemove) {
            if (loop === void 0) { loop = -1; }
            if (autoRemove === void 0) { autoRemove = false; }
            var _this = _super.call(this) || this;
            _this._scaleX = 1;
            _this._scaleY = 1;
            _this._timeScale = 1;
            _this._pauseCount = 0;
            _this._loop = loop;
            _this._autoRemove = autoRemove;
            _this.setAnim(fname, name);
            return _this;
        }
        MovieClip.prototype.setAnim = function (fname, name) {
            if (this.__fname != fname || this.name != name) {
                this.__fname = fname;
                this.name = this.__name || this.__fname;
                loadMovieClipRes(fname, this.onMovieClipLoad, this);
            }
        };
        Object.defineProperty(MovieClip.prototype, "autoRemove", {
            get: function () {
                return this._autoRemove;
            },
            /**设置是否自动移除 */
            set: function (val) {
                this._autoRemove = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MovieClip.prototype, "timeScale", {
            get: function () {
                return this._timeScale;
            },
            /**设置播放速率 */
            set: function (scale) {
                this._timeScale = scale;
                if (this.display) {
                    this.display.frameRate = this.display.movieClipData.frameRate * this._timeScale;
                }
            },
            enumerable: true,
            configurable: true
        });
        MovieClip.prototype.onMovieClipLoad = function (fname, name) {
            var _this = this;
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
                egret.callLater(function () {
                    _this.dispatchEventWith(egret.Event.COMPLETE);
                }, this);
            }
        };
        /** 动画完成播放时回调*/
        MovieClip.prototype.byAnimComplete = function (call, thisObject) {
            if (this._byAnimComplete == null) {
                this._byAnimComplete = new clib.CallbackList();
            }
            this._byAnimComplete.push(call, thisObject);
        };
        MovieClip.prototype.onceAnimComplete = function (cb, thisObject) {
            if (this._onceAnimCompleteCl == null) {
                this._onceAnimCompleteCl = new clib.CallbackList();
            }
            this._onceAnimCompleteCl.push(cb, thisObject);
        };
        /**一次循环完成时回调*/
        MovieClip.prototype.byLoopComplete = function (call, thisObject) {
            if (this._byLoopComplete == null) {
                this._byLoopComplete = new clib.CallbackList();
            }
            this._byLoopComplete.push(call, thisObject);
            // 设置动画监听
            if (this.display && !this.display.hasEventListener(egret.MovieClipEvent.LOOP_COMPLETE)) {
                this.display.addEventListener(egret.MovieClipEvent.LOOP_COMPLETE, this.onLoopComplete, this);
            }
        };
        MovieClip.prototype.onAnimComplete = function () {
            if (this._onceAnimCompleteCl) {
                this._onceAnimCompleteCl.invoke(true);
            }
            if (this._byAnimComplete) {
                this._byAnimComplete.invoke(false);
            }
            if (this._autoRemove && this.parent) {
                this.parent.removeChild(this);
            }
        };
        MovieClip.prototype.onLoopComplete = function () {
            if (this._byLoopComplete) {
                this._byLoopComplete.invoke(false);
            }
        };
        /**移除所有监听 */
        MovieClip.prototype.removeAllListeners = function () {
            if (this._byAnimComplete) {
                this._byAnimComplete.clear();
            }
            if (this._byLoopComplete) {
                this._byLoopComplete.clear();
            }
            if (this._onceAnimCompleteCl) {
                this._onceAnimCompleteCl.clear();
            }
            if (!this.display)
                return;
            this.display.removeEventListener(egret.MovieClipEvent.COMPLETE, this.onAnimComplete, this);
            if (this.display.hasEventListener(egret.MovieClipEvent.LOOP_COMPLETE)) {
                this.display.removeEventListener(egret.MovieClipEvent.LOOP_COMPLETE, this.onLoopComplete, this);
            }
        };
        //根据情况监听消息
        MovieClip.prototype.setupAllListener = function () {
            if (!this.display)
                return;
            if (!this.display.hasEventListener(egret.MovieClipEvent.COMPLETE)) {
                this.display.addEventListener(egret.MovieClipEvent.COMPLETE, this.onAnimComplete, this);
            }
            if (this._byLoopComplete && !this.display.hasEventListener(egret.MovieClipEvent.LOOP_COMPLETE)) {
                this.display.addEventListener(egret.MovieClipEvent.LOOP_COMPLETE, this.onLoopComplete, this);
            }
        };
        MovieClip.prototype.clearDisplay = function () {
            if (this.display) {
                this.display.parent && this.display.parent.removeChild(this.display);
            }
            this.display = null;
        };
        /**fname为文件名 name为要播放的动画名 todo 需要修改为缓存模式*/
        MovieClip.prototype.getMovieClip = function (fname, name) {
            return new egret.MovieClip(mcFactoryDict[fname].generateMovieClipData(name));
        };
        /**
        * 设置播放（不能恢复暂停）
        * @param frame {number} 从第几帧开始（-1表示继续当前帧）
        * @param loop {number} 播放次数（-1表示无限循环）
        */
        MovieClip.prototype.play = function (frame, loop) {
            if (frame === void 0) { frame = -1; }
            if (loop === void 0) { loop = -1; }
            this._loop = loop;
            if (this.display && !this._pauseCount) {
                if (frame >= 0) {
                    this.display.gotoAndPlay(frame, this._loop);
                }
                else {
                    this.display.play(this._loop);
                }
            }
        };
        /** 暂停当前动作 */
        MovieClip.prototype.pause = function () {
            this._pauseCount++;
            if (this._pauseCount == 1 && this.display) {
                this.display.stop();
            }
        };
        /** 恢复当前动作 */
        MovieClip.prototype.resume = function () {
            if (this._pauseCount > 0) {
                this._pauseCount--;
                if (this._pauseCount == 0 && this.display) {
                    this.display.play();
                }
            }
        };
        return MovieClip;
    }(egret.DisplayObjectContainer));
    clib.MovieClip = MovieClip;
    __reflect(MovieClip.prototype, "clib.MovieClip");
})(clib || (clib = {}));
