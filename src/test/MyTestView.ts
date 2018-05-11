// TypeScript file
namespace ctest{
    export class MyTestView extends cui.View{
        testActor:battle.Actor;
        constructor(){
            super({
                layer:cui.layer.base,
                mask:true,
                skin:"MyTestView"
            });
        }
        protected createChildren(){
            super.createChildren();
            this.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTap,this);
        }
        onCreate(){
            this.addChild(new clib.MovieClip("bird"));
            let display = new battle.TestActor();
            let test = new battle.Actor();
            test.display = display;
            this.addChild(display);
            director.instance.container.addEntity(test);
            this.testActor = test;
        }
        onDestroy(){

        }
        onTap(e:egret.TouchEvent){
            let target = new Vec2(e.localX,e.localY);
            this.testActor.onMovePathTo([target]);
        }
    }
}