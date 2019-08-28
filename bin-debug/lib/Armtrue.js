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
var clib;
(function (clib) {
    var dbFactory = new dragonBones.EgretFactory();
    function loadArmtrueRes(name, callBack, thisObject) {
        if (dbFactory.getDragonBonesData(name) && dbFactory.getTextureAtlasData(name)) {
            return callBack && callBack.call(thisObject);
        }
        var sk, tx, tj;
        var skName = name + '_ske_json';
        var tjName = name + '_tex_json';
        var txName = name + '_tex_png';
        egret.assert(RES.hasRes(skName), "loadArmatureRes: skeleton not found(" + skName + ")");
        egret.assert(RES.hasRes(tjName), "loadArmatureRes: spritesheet not found(" + tjName + ")");
        egret.assert(RES.hasRes(txName), "loadArmatureRes: texture not found(" + txName + ")");
        var loadRes = function () {
            if (sk && tx && tj) {
                // if (dbFactory.getDragonBonesData(name)) {
                //     dbFactory.removeDragonBonesData(name);
                // }
                if (dbFactory.getDragonBonesData(name) && dbFactory.getTextureAtlasData(name)) {
                    return callBack && callBack.call(thisObject);
                }
                dbFactory.parseDragonBonesData(sk);
                // if (dbFactory.getTextureAtlasData(name)) {
                //     dbFactory.removeTextureAtlasData(name);
                // }
                dbFactory.parseTextureAtlasData(tj, tx);
                egret.log('load armature: ' + name);
                callBack && callBack.call(thisObject);
            }
        };
        RES.getResAsync(skName, function (data) {
            sk = data;
            loadRes();
        }, null);
        RES.getResAsync(tjName, function (data) {
            tj = data;
            loadRes();
        }, null);
        RES.getResAsync(txName, function (data) {
            tx = data;
            loadRes();
        }, null);
    }
    clib.loadArmtrueRes = loadArmtrueRes;
    function isArmatureSetup(name) {
        return dbFactory.getDragonBonesData(name) != null && dbFactory.getTextureAtlasData(name);
    }
    var Armtrue = (function (_super) {
        __extends(Armtrue, _super);
        function Armtrue(name) {
            var _this = _super.call(this) || this;
            _this._loop = -1;
            _this._addClock = false;
            _this._timeScale = 1;
            _this._name = name;
            if (isArmatureSetup(_this._name)) {
                _this.onArmatureLoad();
            }
            else {
                loadArmtrueRes(_this._name, _this.onArmatureLoad, _this);
            }
            _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.onAdd, _this);
            _this.addEventListener(egret.Event.REMOVED_FROM_STAGE, _this.onRemoved, _this);
            return _this;
        }
        Object.defineProperty(Armtrue.prototype, "armatureName", {
            get: function () {
                return this.display.name;
            },
            enumerable: true,
            configurable: true
        });
        Armtrue.prototype.onArmatureLoad = function () {
            this.display = dbFactory.buildArmature("armatureName", this._name);
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
        };
        /**更新骨骼换装部分 */
        Armtrue.prototype.updateSlotDisplay = function () {
            if (this.slotDisplay) {
                for (var slotName in this.slotDisplay) {
                    var changeDisplay = this.slotDisplay[slotName];
                    var slot = this.display.getSlot(slotName);
                    if (slot) {
                        if (changeDisplay instanceof egret.DisplayObject) {
                            slot.setDisplay(changeDisplay);
                        }
                        else {
                            dbFactory.replaceSlotDisplay(this._name, this._name, slotName, changeDisplay, this.display.getSlot(slotName));
                        }
                    }
                    else {
                        var name_1 = this._name;
                        egret.error("Armature.setSlotDisplay: slot not found(" + slotName + " in " + name_1 + ")");
                    }
                }
                this.slotDisplay = null;
            }
        };
        Armtrue.prototype.changeSlotDisplay = function (slotName, change) {
            this.slotDisplay = this.slotDisplay || {};
            this.slotDisplay[slotName] = change;
            if (this.display) {
                this.updateSlotDisplay();
            }
        };
        Armtrue.prototype.onAdd = function () {
            if (!this._addClock && this.display && this.stage) {
                this._addClock = true;
                this.display._dragonBones.clock.add(this.display);
            }
        };
        Armtrue.prototype.onRemoved = function () {
            this._addClock = false;
            this.display._dragonBones.clock.remove(this.display);
        };
        /**
         * 动画完成播放时回调
         */
        Armtrue.prototype.byAnimComplete = function (call, thisObject) {
            if (this._byAnimComplete == null) {
                this._byAnimComplete = new clib.CallbackList();
            }
            this._byAnimComplete.push(call, thisObject);
            // 设置动画监听
            if (this.display && !this.display.hasEventListener(dragonBones.AnimationEvent.COMPLETE)) {
                this.display.addEventListener(dragonBones.AnimationEvent.COMPLETE, this.onAnimComplete, this);
            }
        };
        /**
         * 动画完成播放时回调(单次)
         */
        Armtrue.prototype.onceAnimComplete = function (call, thisObject) {
            if (this._onceAnimComplete == null) {
                this._onceAnimComplete = new clib.CallbackList();
            }
            this._onceAnimComplete.push(call, thisObject);
            // 设置动画监听
            if (this.display && !this.display.hasEventListener(dragonBones.AnimationEvent.COMPLETE)) {
                this.display.addEventListener(dragonBones.AnimationEvent.COMPLETE, this.onAnimComplete, this);
            }
        };
        /**
         * 一次循环完成时回调
         */
        Armtrue.prototype.byLoopComplete = function (call, thisObject) {
            if (this._byLoopComplete == null) {
                this._byLoopComplete = new clib.CallbackList();
            }
            this._byLoopComplete.push(call, thisObject);
            // 设置动画监听
            if (this.display && !this.display.hasEventListener(dragonBones.Event.LOOP_COMPLETE)) {
                this.display.addEventListener(dragonBones.Event.LOOP_COMPLETE, this.onLoopComplete, this);
            }
        };
        /**
         * 一次循环完成时回调(单次)
         */
        Armtrue.prototype.onceLoopComplete = function (call, thisObject) {
            if (this._onceLoopComplete == null) {
                this._onceLoopComplete = new clib.CallbackList();
            }
            this._onceLoopComplete.push(call, thisObject);
            // 设置动画监听
            if (this.display && !this.display.hasEventListener(dragonBones.Event.LOOP_COMPLETE)) {
                this.display.addEventListener(dragonBones.Event.LOOP_COMPLETE, this.onLoopComplete, this);
            }
        };
        Armtrue.prototype.onAnimComplete = function () {
            if (this._byAnimComplete) {
                this._byAnimComplete.invoke(false);
            }
            if (this._onceAnimComplete) {
                this._onceAnimComplete.invoke(true);
            }
        };
        Armtrue.prototype.onLoopComplete = function () {
            if (this._byLoopComplete) {
                this._byLoopComplete.invoke(false);
            }
            if (this._onceLoopComplete) {
                this._onceLoopComplete.invoke(true);
            }
        };
        /**播放动画 */
        Armtrue.prototype.play = function (anim, loop) {
            if (loop === void 0) { loop = -1; }
            this._anim = anim;
            this._loop = loop;
            if (this.display) {
                this.display.animation.play(anim, this._loop);
            }
        };
        /**停止动画 */
        Armtrue.prototype.stop = function (anim) {
            if (this.display) {
                this.display.animation.stop(anim);
            }
            this._anim = null;
        };
        Object.defineProperty(Armtrue.prototype, "timeScale", {
            get: function () {
                return this._timeScale;
            },
            /**控制动画播放速度 */
            set: function (v) {
                this._timeScale = v;
                if (this.display) {
                    this.display.animation.timeScale = v;
                }
            },
            enumerable: true,
            configurable: true
        });
        return Armtrue;
    }(eui.Component));
    clib.Armtrue = Armtrue;
    __reflect(Armtrue.prototype, "clib.Armtrue");
})(clib || (clib = {}));
