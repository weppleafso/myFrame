//设计思路这么清晰，不写注释了
namespace globalEvent {
    let _eventHandlerList: { [id: string]: any[] } = {};
    let _onceHandlerList: { [id: string]: any[] } = {};
    let _lock: { [id: string]: boolean } = {};
    export function addEventListener(eventName: string, handler: Function, thisObject: any) {
        _eventHandlerList[eventName] = _eventHandlerList[eventName] || [];
        let list = _eventHandlerList[eventName];
        let listen = [handler, thisObject];
        list.push(listen);
        if (thisObject instanceof egret.DisplayObject) {
            thisObject.addEventListener(egret.Event.REMOVED_FROM_STAGE, function () {
                _remove(list, handler, thisObject);
            }, this);
        }
    }
    export function removeEventListener(eventName: string, handler: Function, thisObject: any) {
        _eventHandlerList[eventName] = _eventHandlerList[eventName] || [];
        let list = _eventHandlerList[eventName];
        _remove(list, handler, thisObject);
    }
    export function once(eventName: string, handler: Function, thisObject: any) {
        _onceHandlerList[eventName] = _onceHandlerList[eventName] || [];
        let list = _eventHandlerList[eventName];
        let listen = [handler, thisObject];
        list.push(listen);
        if (thisObject instanceof egret.DisplayObject) {
            thisObject.addEventListener(egret.Event.REMOVED_FROM_STAGE, function () {
                _remove(list, handler, thisObject);
            }, this);
        }
    }
    export function dispatchEvent(eventName, ...args: any[]) {
        if (_lock[eventName]) {
            egret.error("重复事件触发:", eventName);
        }
        _lock[eventName] = true;
        let list = _eventHandlerList[eventName];
        for (let i = 0; i < list.length; i++) {
            let [handler, thisObject] = list[i];
            handler.call(thisObject, args);
        }
        list = _onceHandlerList[eventName];
        for (let i = 0; i < list.length; i++) {
            let [handler, thisObject] = list[i];
            handler.call(thisObject, args);
        }
        list.length = 0;
        _lock[eventName] = false;
    }
    function _checkHasIn(list: any[], handler: Function, thisObject: any) {
        for (let i = 0, len = list.length; i < len; i++) {
            if (list[i][0] == handler && list[i][1] == thisObject) {
                return i;
            }
        }
        return -1;
    }
    function _remove(list: any[], handler: Function, thisObject: any) {
        let index = _checkHasIn(list, handler, thisObject);
        if (index != -1) {
            list.splice(index, 1);
        }
        else {
            egret.error("no Has in EventList");
        }
    }

    export class EventName {
        static CONST = "const";
    }
}