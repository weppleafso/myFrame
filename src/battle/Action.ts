namespace battle {
    export enum ActionState {
        stop = 0,
        runing = 1,
        end = 2,
        cancel = 3,
    }
    export var ActionName = {
        IDEL: "idle",
        ATTACK: "attack",
        SKILL: "skill",
        MOVETARGET: "moveTarget",
        PARALLEL: "parallel",
        QUEUE: "quene"
    }
    /**
     * 设计思路 每个Actor下面有自己的action
     * onBegin 开始动作
     * 动作结束后执行_runEnd
     */
    export abstract class ActionBase {
        /**动作的目标 */
        target: Actor;
        /**动作的名字 */
        name: string;
        /**完成动作回调 */
        completeHandler: clib.CallbackList;
        /**取消回调 */
        cancelHandler: clib.CallbackList;
        /**动作的状态 */
        state: ActionState;
        constructor(target) {
            this.target = target;
            this.state = ActionState.stop;
            this.completeHandler = new clib.CallbackList();
            this.cancelHandler = new clib.CallbackList();
        }

        byComplete(completeHandler: Function,thiz:any) {
            this.completeHandler.push(completeHandler,thiz);
        }
        byCancel(cancelHandler: Function,thiz) {
            this.cancelHandler.push(cancelHandler,thiz);
        }
        onBegin() {
            this.state = ActionState.runing;
            this._onBegin();
        }

        onUpdate() {
            if (this.state == ActionState.runing) {
                this._update();
            }
        }
        private _destroy() {
            this.completeHandler.clear();
            this.cancelHandler.clear();
            this.target = null;
        }

        protected runEnd() {
            this.state = ActionState.end;
            this.completeHandler.invoke();
            this._destroy();
        }
        onCancel() {
            this.state = ActionState.cancel;
            this.cancelHandler.invoke();
            this._destroy();
        }

        protected abstract _onBegin();
        protected abstract _update();
    }
    /**等待动作 */
    export class ActionIdle extends ActionBase {
        constructor(target) {
            super(target);
            this.name = ActionName.IDEL;
        }
        protected _onBegin() {
            this.target && this.target.playIdle();
        }
        /**空函数，不执行内容 */
        protected _update() {

        }
    }
    /**
     * 攻击动作 
     * playAttack 参数 攻击完成的时候回调
     * 
     * */
    export class ActionAttack extends ActionBase {
        param: any[];
        constructor(target, param: any[]) {
            super(target);
            this.name = ActionName.ATTACK;
            this.param = param;
        }
        protected _onBegin() {
            this.target && this.target.playAttack(this.runEnd, this.param);
        }
        /**空函数，不执行内容 */
        protected _update() {

        }
    }
    /**
     * 技能动作
     * playSkill 参数 技能释放完成的时候回调
     * 
     */
    export class ActionSkill extends ActionBase {
        /**技能参数 */
        param: any[];
        constructor(target, param: any[]) {
            super(target);
            this.name = "skill";
            this.param = param;
        }
        protected _onBegin() {
            this.target && this.target.playSkill(this.runEnd, this.param);
        }
        /**空函数，不执行内容 */
        protected _update() {

        }
    }
    /**
     * 移动动作
     * playMove 
     */
    export class ActionMoveTarget extends ActionBase {
        /**移动的目标 */
        param: Vec2[];
        /**当前移动到第几个点 */
        index: number;
        toAngel: number;
        angelRotion: number;
        constructor(target, param: any[]) {
            super(target);
            this.name = "moveTarget";
            this.param = param;
        }
        protected _onBegin() {
            this.index = 0;
            if(this.param && this.param.length > 0){
                this.updateDir();
            }
            else{
                this.onCancel();
            }
            
        }
        protected _update() {
            let speed = this.target.speed;
            let angelSpeed = this.target.angelSpeed;
            let tickSec = director.instance.tickSec;

            //计算转身
            let fromAngle = this.target.dir;
            if (fromAngle != this.toAngel) {
                let angel = angelSpeed * tickSec;

                if (this.angelRotion > 0) {
                    let toAngel = fromAngle + angel;
                    if (toAngel > this.toAngel) {
                        this.target.dir = this.toAngel;
                    }
                    else {
                        this.target.dir = toAngel;
                    }
                }
                else {
                    let toAngel = fromAngle - angel;
                    if (toAngel < this.toAngel) {
                        this.target.dir = this.toAngel;
                    }
                    else {
                        this.target.dir = toAngel;
                    }
                }
            }

            let dis = speed * tickSec;
            let toPos = this.param[this.index];
            let fromPos = this.target.pos;
            let maxDis = Vec2.distance(toPos, fromPos);
            if (maxDis < dis) {
                this.target.setPos(toPos.x, toPos.y);
                this.index++;
                if (this.index >= this.param.length) {
                    this.runEnd();
                }
                else {
                    this.updateDir();
                }
            }
            else {
                let dx = dis * Math.cos(this.toAngel);
                let dy = dis * Math.sin(this.toAngel);
                this.target.setPos(fromPos.x + dx, fromPos.y + dy);
            }
        }
        updateDir() {
            let toPos = this.param[this.index];
            let vpos = this.target.pos;
            this.toAngel = Vec2.sub(toPos, vpos).angle;
            this.angelRotion = this.toAngel > this.target.dir ? 1 : -1;
        }
    }
    export class ActionParallel extends ActionBase {
        actions: ActionBase[];
        endActionNum: number;
        constructor(target, actions: ActionBase[]) {
            super(target);
            this.actions = actions;
            this.name = ActionName.PARALLEL;
        }
        protected _onBegin() {
            this.endActionNum = 0;
            for (let i = 0, len = this.actions.length; i < len; i++) {
                this.actions[i].onBegin();
                this.actions[i].byComplete(this.onActionEnd,this);
            }
        }
        protected _update() {
            for (let i = 0, len = this.actions.length; i < len; i++) {
                this.actions[i].onUpdate();
            }
        }
        onCancel() {
            for (let i = 0, len = this.actions.length; i < len; i++) {
                this.actions[i].onCancel();
            }
            super.onCancel();
        }
        onActionEnd() {
            this.endActionNum++;
            if (this.endActionNum >= this.actions.length) {
                this.runEnd();
            }
        }
    }
    export class ActionQueue extends ActionBase {
        actions: ActionBase[];
        index: number;
        current: ActionBase;
        constructor(target, actions: ActionBase[]) {
            super(target);
            this.actions = actions;
            this.name = ActionName.QUEUE;
        }
        protected _onBegin() {
            this.index = -1;
            this.onNextAction();
        }
        private onNextAction() {
            this.index++;
            this.current = this.actions[this.index];
            if (this.index == this.actions.length - 1) {
                this.current.byComplete(this.runEnd,this);
            }
            else {
                this.current.byComplete(this.onNextAction,this);
            }
            this.current.onBegin();

        }
        protected _update() {
            this.current.onUpdate();
        }
        onCancel() {
            this.current.onCancel();
            super.onCancel();
        }
    }
}