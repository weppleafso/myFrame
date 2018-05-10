namespace battle{
    export class Actor extends cval.Entity{
        /**当前正在执行的动作 */
        action:ActionBase;
        /**显示对象 */
        display:egret.DisplayObject;
        /**当前位置 只能用来显示位置，设置需要使用setPos*/
        pos:Vec2;
        /**移动速度 单位每秒*/
        speed:number;
        /**转身速率 */
        angelSpeed:number;
        /**方向*/
        _dir:number;
        
        onCreate(){
            this.pos = Vec2.zero();
            this.dir = Math.PI/2;
            this.speed = 300;
            this.angelSpeed = Math.PI;
            this.display.x = this.pos.x;
            this.display.y = this.pos.y;
        }
        onDestroy(){
            if(this.display && this.display.parent){
                this.display.parent.removeChild(this.display);
            }
        }
        onUpdate(){
            if(this.action){
                this.action.onUpdate();
            }
        }
        playIdle(){
            egret.log("idle");
        }
        playAttack(runEnd:Function,param:any[]){
            egret.log("attack");
            runEnd();
        }
        playSkill(runEnd:Function,param:any[]){
            egret.log("skill");
            runEnd();
        }

        set dir(angle:number){
            this._dir = angle;
            //更新模型
            this.display.rotation = this.dir / Math.PI  * 180;
        }
        get dir(){
            return this._dir;
        }
        /**更新位置 如果设置了一个不可到达的位置，需要取消上一个动作，重新计算路径*/
        setPos(x:number,y:number){
            this.pos.x = x;
            this.pos.y = y;
            this.display.x = this.pos.x;
            this.display.y = this.pos.y;
        }
        onMoveTo(targets:Vec2[]){
            this.cancelAction();
            this.action = new ActionMoveTarget(this,targets);
            this.action.onBegin();
        }
        cancelAction(){
            if(this.action){
                this.action.onCancel();
                this.action = null;
            }
        }
    }
}