// TypeScript file
namespace clib {

    var dbFactory: dragonBones.EgretFactory = new dragonBones.EgretFactory();
    export function loadArmtrueRes(name: string, callBack: Function, thisObject?: any) {
        if (dbFactory.getDragonBonesData(name) && dbFactory.getTextureAtlasData(name)) {
            callBack && callBack.call(thisObject);
        }
        let sk, tx, tj;
        let skName = name + '_ske_json';
        let tjName = name + '_tex_json';
        let txName = name + '_tex_png';
        egret.assert(RES.hasRes(skName), `loadArmatureRes: skeleton not found(${skName})`);
        egret.assert(RES.hasRes(tjName), `loadArmatureRes: spritesheet not found(${tjName})`);
        egret.assert(RES.hasRes(txName), `loadArmatureRes: texture not found(${txName})`);

        var loadRes = function () {
            if (sk && tx && tj) {
                if (dbFactory.getDragonBonesData(name)) {
                    dbFactory.removeDragonBonesData(name);
                }
                dbFactory.parseDragonBonesData(sk);
                if (dbFactory.getTextureAtlasData(name)) {
                    dbFactory.removeTextureAtlasData(name);
                }
                dbFactory.parseTextureAtlasData(tj, tx);
                egret.log('load armature: ' + name);
                callBack && callBack.call(thisObject);
            }
        }
        RES.getResAsync(skName, (data) => {
            let sk = data;
            loadRes();
        }, null);
        RES.getResAsync(tjName, (data) => {
            let tj = data;
            loadRes();
        }, null);
        RES.getResAsync(txName, (data) => {
            let tx = data;
            loadRes();
        }, null);
    }

    function isArmatureSetup(name: string) {
        return dbFactory.getDragonBonesData(name) != null && dbFactory.getTextureAtlasData(name);
    }

    export class Armtrue extends eui.Component {

        display: dragonBones.Armature;

        private _name: string;
        private _anim: string;
        private _loop: number = -1;

        private _byAnimComplete: CallbackList;
        private _byLoopComplete: CallbackList;
        private _onceAnimComplete: CallbackList;
        private _onceLoopComplete: CallbackList;

        private _addClock: boolean = false;
        private _timeScale: number = 1;

        get armatureName(): string {
            return this.display.name;
        }
        constructor(name) {
            super();
            this._name = name;
            if (isArmatureSetup(this._name)) {
                this.onArmatureLoad();
            }
            else {
                loadArmtrueRes(this._name, this.onArmatureLoad, this);
            }
            this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAdd, this);
            this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemoved, this);
        }

        private onArmatureLoad() {
            this.display = dbFactory.buildArmature(this._name);
            this.addChildAt(this.display.display, 0);
            this.onAdd();
            if (this._byAnimComplete || this._onceAnimComplete) {
                this.display.addEventListener(dragonBones.Event.COMPLETE, this.onAnimComplete, this);
            }
            if (this._byLoopComplete || this._onceLoopComplete) {
                this.display.addEventListener(dragonBones.Event.LOOP_COMPLETE, this.onLoopComplete, this);
            }
            if (this._anim) {
                this.play(this._anim, this._loop);
            }
            this.display.animation.timeScale = this._timeScale;
            // 换装部分
            this.updateSlotDisplay();

        }
        private slotDisplay: { [slotName: string]: egret.DisplayObject | string };
        /**更新骨骼换装部分 */
        private updateSlotDisplay() {
            if (this.slotDisplay) {
                for (let slotName in this.slotDisplay) {
                    let changeDisplay = this.slotDisplay[slotName];
                    let slot = this.display.getSlot(slotName);
                    if (slot) {
                        if (changeDisplay instanceof egret.DisplayObject) {
                            slot.setDisplay(changeDisplay);
                        }
                        else {
                            dbFactory.replaceSlotDisplay(this._name, this._name, slotName, changeDisplay, this.display.getSlot(slotName));

                        }
                    }
                    else {
                        let name = this._name;
                        egret.error(`Armature.setSlotDisplay: slot not found(${slotName} in ${name})`);
                    }

                }
                this.slotDisplay = null;
            }
        }
        public changeSlotDisplay(slotName: string, change: string | egret.DisplayObject) {
            this.slotDisplay = this.slotDisplay || {};
            this.slotDisplay[slotName] = change;
            if (this.display) {
                this.updateSlotDisplay();
            }
        }
        private onAdd() {
            if (!this._addClock && this.display && this.stage) {
                this._addClock = true;
                dragonBones.WorldClock.clock.add(this.display);
            }
        }

        private onRemoved() {
            dragonBones.WorldClock.clock.remove(this.display);
        }

        /**
         * 动画完成播放时回调
         */
        byAnimComplete(call: Function, thisObject?: any) {
            if (this._byAnimComplete == null) {
                this._byAnimComplete = new CallbackList();
            }
            this._byAnimComplete.push(call, thisObject);
            // 设置动画监听
            if (this.display && !this.display.hasEventListener(dragonBones.AnimationEvent.COMPLETE)) {
                this.display.addEventListener(dragonBones.AnimationEvent.COMPLETE, this.onAnimComplete, this);
            }
        }

		/**
         * 动画完成播放时回调(单次)
         */
        onceAnimComplete(call: Function, thisObject?: any) {
            if (this._onceAnimComplete == null) {
                this._onceAnimComplete = new CallbackList();
            }
            this._onceAnimComplete.push(call, thisObject);
            // 设置动画监听
            if (this.display && !this.display.hasEventListener(dragonBones.AnimationEvent.COMPLETE)) {
                this.display.addEventListener(dragonBones.AnimationEvent.COMPLETE, this.onAnimComplete, this);
            }
        }

        /**
         * 一次循环完成时回调
         */
        byLoopComplete(call: Function, thisObject?: any) {
            if (this._byLoopComplete == null) {
                this._byLoopComplete = new CallbackList();
            }
            this._byLoopComplete.push(call, thisObject);
            // 设置动画监听
            if (this.display && !this.display.hasEventListener(dragonBones.Event.LOOP_COMPLETE)) {
                this.display.addEventListener(dragonBones.Event.LOOP_COMPLETE, this.onLoopComplete, this);
            }
        }

        /**
         * 一次循环完成时回调(单次)
         */
        onceLoopComplete(call: Function, thisObject?: any) {
            if (this._onceLoopComplete == null) {
                this._onceLoopComplete = new CallbackList();
            }
            this._onceLoopComplete.push(call, thisObject);
            // 设置动画监听
            if (this.display && !this.display.hasEventListener(dragonBones.Event.LOOP_COMPLETE)) {
                this.display.addEventListener(dragonBones.Event.LOOP_COMPLETE, this.onLoopComplete, this);
            }
        }

        private onAnimComplete() {
            if (this._byAnimComplete) {
                this._byAnimComplete.invoke(false);
            }
            if (this._onceAnimComplete) {
                this._onceAnimComplete.invoke(true);
            }
        }

        private onLoopComplete() {
            if (this._byLoopComplete) {
                this._byLoopComplete.invoke(false);
            }
            if (this._onceLoopComplete) {
                this._onceLoopComplete.invoke(true);
            }
        }
        /**播放动画 */
        public play(anim: string, loop = -1) {
            this._anim = anim;
            this._loop = loop;
            if (this.display) {
                this.display.animation.play(anim, this._loop);
            }
        }
        /**停止动画 */
        public stop(anim?: string) {
            if (this.display) {
                this.display.animation.stop(anim);
            }
            this._anim = null;
        }

        /**控制动画播放速度 */
        set timeScale(v: number) {
            this._timeScale = v;
            if (this.display) {
                this.display.animation.timeScale = v;
            }
        }

        get timeScale(): number {
            return this._timeScale;
        }

    }
}