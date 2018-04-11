namespace clib{

    /**
     * 回调列表的标准实现
     */
    export class CallbackList {

        private _list: any[][];

        /** 加入回调列表 */
        push(call: Function, thisObject?: any) {
            if (this._list == null) {
                this._list = [];
            }
            this._list.push([call, thisObject]);
        }

        /** 从回调列表移除 */
        remove(call: Function, thisObject?: any) {
            if (this._list) {
                this._list = this._list.filter(function (item) {
                    if (item[0] == call && item[1] == thisObject) {
                        return false;
                    }
                    return true;
                });
            }
        }

        /** 
         * 执行回调函数
         * @param clearList {boolean} 是否清除回调列表
         * @param thisObject {any} 提供默认this对象（push时如果设置了this，优先使用push时的this）
         * @param ...args {any[]} 回调的参数
         */
        invoke(clearList = true, thisObject?: any, ...args: any[]) {
            if (this._list) {
                for (var i in this._list) {
                    var func: Function = this._list[i][0];
                    var thiz = this._list[i][1] || thisObject;
                    func.apply(thiz, args);
                }
                if (clearList) {
                    this._list = null;
                }
            }
        }

        /**
         * 清空列表
         */
        clear() {
            this._list = null;
        }
    }

    /**
     * 用于等待多次调用结果完成
     * 1）创建该对象，在构造函数中给定全部完成的回调
     * 2）将add方法返回的函数交给单次完成的回调
     * 3）调用start开始等待
     * （不应该保存该对象的引用）
     */
    export class Wait {

        private _start: boolean;
        private _call: Function;
        private _thiz: any;
        private _args: any[];
        private _canceled: boolean;

        private _addList: Function[];

        constructor(finish: Function, thisObject: any, ...args: any[]) {
            this._call = finish;
            this._thiz = thisObject;
            this._args = args;
            this._addList = [];
            this._start = false;
        }

        add(cb?: Function): Function {
            var ret = () => {
                var index = this._addList.indexOf(ret);
                if (index >= 0) {
                    if (cb) {
                        cb();
                    }
                    this._addList.splice(index, 1);
                    if (this._start) {
                        if (this._addList.length == 0) {
                            this.fire();
                        }
                    }
                }
            };
            this._addList.push(ret);
            return ret;
        }

        start() {
            this._start = true;
            this._canceled = false;
            if (this._addList.length == 0) {
                this.fire();
            }
        }

        cancel() {
            this._canceled = true;
        }

        private fire() {
            if (this._call && !this._canceled) {
                this._call.apply(this._thiz, this._args);
            }
        }
    }

    /** 
     * 顺序计算
     * 1）tasks为任务列表，每个任务为一个函数，其参数为callback
     * 2）所有任务在调用start时，顺序执行。当前一个任务完成后开始后一个任务。
     * 3）当任务完成时，调用callback。callback的参数为err，如果err == true则表示任务出错。
     * 4）如果任务成功，则继续执行后一个任务。如果任务失败则停止。
     * 5）当任务全部成功，或者失败会回调finish。如果失败，则参数为失败的callback的err。
     */
    export class Sequence {

        private tasks: Function[];
        private finish: Function;
        private index = -1;
        private timer: any;
        private cancelled = false;

        constructor(tasks: Function[], finish: Function) {
            this.tasks = tasks;
            this.finish = finish;
        }

        /** 开始任务序列 */
        start() {
            if (this.index < 0) {
                this.invoke();
            }
            else {
                egret.error('Sequence: already started');
            }
        }

        /** 
         * 取消任务序列
         * 取消后不会触发下面的任务，也不会触发finish方法
         */
        cancel() {
            this.cancelled = true;
        }

        private invoke() {
            this.index++;
            if (this.index < this.tasks.length) {
                var task = this.tasks[this.index];
                var id = this.index;
                task((err) => {
                    if (this.cancelled) return;
                    // 防止反复调用finish方法
                    if (this.index == id) {
                        if (err) {
                            this.index = null;
                            this.finish(err);
                        }
                        else {
                            this.invoke();
                        }
                    }
                });
            }
            else {
                this.index = null;
                this.finish();
            }
        }
    }

    /**
     * 并行计算
     * 1）tasks为任务列表，每个任务为一个函数，其参数为callback
     * 2）所有任务在调用start的时候，同时开始。
     * 3）当任务完成时，调用callback。callback的参数为其结果，如果留空则会被当成null。
     * 4）当所有任务都完成后，会回调finish，其参数为所有任务的结果数组。
     */
    export class Parallel {

        private tasks: Function[];
        private finish: Function;
        private results: any[];
        private cancelled = false;

        constructor(tasks: Function[], finish: Function) {
             this.tasks = tasks;
             this.finish = finish;
             this.results = null;
        }

        /** 开始同步任务 */
        start() {
            if (this.results == null) {
                this.results = [];
                for (let i=0; i<this.tasks.length; ++i) {
                    this.results[i] = undefined;
                }
                for (let i=0; i<this.tasks.length; ++i) {
                    this.invoke(i);
                }
            }
            else {
                egret.error('Parallel: already started');
            }
        }

        /** 取消同步任务 */
        cancel() {
            this.cancelled = true;
        }

        private invoke(id: number) {
            this.tasks[id]((err)=> {
                if (this.cancelled) return;
                // 防止反复调用
                if (this.results[id] === undefined) {
                    if (err === undefined) err = null;
                    this.results[id] = err;
                    // check all complete
                    for (let i=0; i<this.results.length; ++i) {
                        if (this.results[i] === undefined) {
                            return;
                        }
                    }
                    this.finish(this.results);
                }
            });
        }
    }

    export function startSequence(tasks: Function[], finish: Function) {
        var seq = new Sequence(tasks, finish);
        seq.start();
        return seq;
    }

    export function startParallel(tasks: Function[], finish: Function) {
        var par = new Parallel(tasks, finish);
        par.start();
        return par;
    }
}