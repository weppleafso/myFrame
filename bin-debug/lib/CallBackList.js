var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var clib;
(function (clib) {
    /**
     * 回调列表的标准实现
     */
    var CallbackList = (function () {
        function CallbackList() {
        }
        /** 加入回调列表 */
        CallbackList.prototype.push = function (call, thisObject) {
            if (this._list == null) {
                this._list = [];
            }
            this._list.push([call, thisObject]);
        };
        /** 从回调列表移除 */
        CallbackList.prototype.remove = function (call, thisObject) {
            if (this._list) {
                this._list = this._list.filter(function (item) {
                    if (item[0] == call && item[1] == thisObject) {
                        return false;
                    }
                    return true;
                });
            }
        };
        /**
         * 执行回调函数
         * @param clearList {boolean} 是否清除回调列表
         * @param thisObject {any} 提供默认this对象（push时如果设置了this，优先使用push时的this）
         * @param ...args {any[]} 回调的参数
         */
        CallbackList.prototype.invoke = function (clearList, thisObject) {
            if (clearList === void 0) { clearList = true; }
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            if (this._list) {
                for (var i in this._list) {
                    var func = this._list[i][0];
                    var thiz = this._list[i][1] || thisObject;
                    func.apply(thiz, args);
                }
                if (clearList) {
                    this._list = null;
                }
            }
        };
        /**
         * 清空列表
         */
        CallbackList.prototype.clear = function () {
            this._list = null;
        };
        return CallbackList;
    }());
    clib.CallbackList = CallbackList;
    __reflect(CallbackList.prototype, "clib.CallbackList");
    /**
     * 用于等待多次调用结果完成
     * 1）创建该对象，在构造函数中给定全部完成的回调
     * 2）将add方法返回的函数交给单次完成的回调
     * 3）调用start开始等待
     * （不应该保存该对象的引用）
     */
    var Wait = (function () {
        function Wait(finish, thisObject) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            this._call = finish;
            this._thiz = thisObject;
            this._args = args;
            this._addList = [];
            this._start = false;
        }
        Wait.prototype.add = function (cb) {
            var _this = this;
            var ret = function () {
                var index = _this._addList.indexOf(ret);
                if (index >= 0) {
                    if (cb) {
                        cb();
                    }
                    _this._addList.splice(index, 1);
                    if (_this._start) {
                        if (_this._addList.length == 0) {
                            _this.fire();
                        }
                    }
                }
            };
            this._addList.push(ret);
            return ret;
        };
        Wait.prototype.start = function () {
            this._start = true;
            this._canceled = false;
            if (this._addList.length == 0) {
                this.fire();
            }
        };
        Wait.prototype.cancel = function () {
            this._canceled = true;
        };
        Wait.prototype.fire = function () {
            if (this._call && !this._canceled) {
                this._call.apply(this._thiz, this._args);
            }
        };
        return Wait;
    }());
    clib.Wait = Wait;
    __reflect(Wait.prototype, "clib.Wait");
    /**
     * 顺序计算
     * 1）tasks为任务列表，每个任务为一个函数，其参数为callback
     * 2）所有任务在调用start时，顺序执行。当前一个任务完成后开始后一个任务。
     * 3）当任务完成时，调用callback。callback的参数为err，如果err == true则表示任务出错。
     * 4）如果任务成功，则继续执行后一个任务。如果任务失败则停止。
     * 5）当任务全部成功，或者失败会回调finish。如果失败，则参数为失败的callback的err。
     */
    var Sequence = (function () {
        function Sequence(tasks, finish) {
            this.index = -1;
            this.cancelled = false;
            this.tasks = tasks;
            this.finish = finish;
        }
        /** 开始任务序列 */
        Sequence.prototype.start = function () {
            if (this.index < 0) {
                this.invoke();
            }
            else {
                egret.error('Sequence: already started');
            }
        };
        /**
         * 取消任务序列
         * 取消后不会触发下面的任务，也不会触发finish方法
         */
        Sequence.prototype.cancel = function () {
            this.cancelled = true;
        };
        Sequence.prototype.invoke = function () {
            var _this = this;
            this.index++;
            if (this.index < this.tasks.length) {
                var task = this.tasks[this.index];
                var id = this.index;
                task(function (err) {
                    if (_this.cancelled)
                        return;
                    // 防止反复调用finish方法
                    if (_this.index == id) {
                        if (err) {
                            _this.index = null;
                            _this.finish(err);
                        }
                        else {
                            _this.invoke();
                        }
                    }
                });
            }
            else {
                this.index = null;
                this.finish();
            }
        };
        return Sequence;
    }());
    clib.Sequence = Sequence;
    __reflect(Sequence.prototype, "clib.Sequence");
    /**
     * 并行计算
     * 1）tasks为任务列表，每个任务为一个函数，其参数为callback
     * 2）所有任务在调用start的时候，同时开始。
     * 3）当任务完成时，调用callback。callback的参数为其结果，如果留空则会被当成null。
     * 4）当所有任务都完成后，会回调finish，其参数为所有任务的结果数组。
     */
    var Parallel = (function () {
        function Parallel(tasks, finish) {
            this.cancelled = false;
            this.tasks = tasks;
            this.finish = finish;
            this.results = null;
        }
        /** 开始同步任务 */
        Parallel.prototype.start = function () {
            if (this.results == null) {
                this.results = [];
                for (var i = 0; i < this.tasks.length; ++i) {
                    this.results[i] = undefined;
                }
                for (var i = 0; i < this.tasks.length; ++i) {
                    this.invoke(i);
                }
            }
            else {
                egret.error('Parallel: already started');
            }
        };
        /** 取消同步任务 */
        Parallel.prototype.cancel = function () {
            this.cancelled = true;
        };
        Parallel.prototype.invoke = function (id) {
            var _this = this;
            this.tasks[id](function (err) {
                if (_this.cancelled)
                    return;
                // 防止反复调用
                if (_this.results[id] === undefined) {
                    if (err === undefined)
                        err = null;
                    _this.results[id] = err;
                    // check all complete
                    for (var i = 0; i < _this.results.length; ++i) {
                        if (_this.results[i] === undefined) {
                            return;
                        }
                    }
                    _this.finish(_this.results);
                }
            });
        };
        return Parallel;
    }());
    clib.Parallel = Parallel;
    __reflect(Parallel.prototype, "clib.Parallel");
    function startSequence(tasks, finish) {
        var seq = new Sequence(tasks, finish);
        seq.start();
        return seq;
    }
    clib.startSequence = startSequence;
    function startParallel(tasks, finish) {
        var par = new Parallel(tasks, finish);
        par.start();
        return par;
    }
    clib.startParallel = startParallel;
})(clib || (clib = {}));
//# sourceMappingURL=CallBackList.js.map