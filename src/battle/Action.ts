namespace battle {
    export enum ActionState {
        stop = 0,
        runing = 1,
        end = 2,
        cancel = 3,
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
        completeHandler: Function;
        /**取消回调 */
        cancelHandler: Function;
        /**动作的状态 */
        state: ActionState;
        constructor(target) {
            this.target = target;
            this.state = ActionState.stop;
        }

        byComplete(completeHandler) {
            this.completeHandler = completeHandler;
        }
        byCancel(cancelHandler) {
            this.cancelHandler = cancelHandler;
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

        protected runEnd() {
            this.state = ActionState.end;
            this.target = null;
            this.completeHandler && this.completeHandler();
        }
        onCancel() {
            this.state = ActionState.cancel;
            this.cancelHandler && this.cancelHandler();
            this.target = null;
        }

        protected abstract _onBegin();
        protected abstract _update();
    }
    /**等待动作 */
    export class ActionIdle extends ActionBase {
        constructor(target) {
            super(target);
            this.name = "idle";
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
            this.name = "attack";
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
            this.updateDir();
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
            this.toAngel = Vec2.sub(toPos,vpos).angle;
            this.angelRotion = this.toAngel > this.target.dir ? 1 : -1;
        }
    }
}