// TypeScript file
namespace ctest{
    export class MyTestView extends cui.View{
        testActor:battle.Actor;
        gpMap:eui.Group;
        shape:egret.Shape;
        pathFinder:battle.PathFinder;
        constructor(){
            super({
                layer:cui.layer.base,
                mask:true,
                skin:"MyTestView"
            });
        }
        protected createChildren(){
            super.createChildren();
            this.shape = new egret.Shape();
            this.addChildAt(this.shape,0);
            this.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTap,this);
        }
        onCreate(){
            // this.addChild(new clib.MovieClip("bird"));
            let display = new battle.TestActor();
            let test = new battle.Actor();
            test.display = display;
            this.addChild(display);
            director.instance.container.addEntity(test);
            this.testActor = test;
            this.pathFinder = new battle.PathFinder();
            this.pathFinder.init();
            this.pathFinder.drawRect(this.shape);
            clib.useCache(battle.TestActor,function(obj:battle.TestActor,a:number){
                console.log(a);
            })
        }
        onDestroy(){

        }
        onTap(e:egret.TouchEvent){
            let target = new Vec2(e.localX,e.localY);
            let ret =this.pathFinder.calculatePath(this.testActor.pos,target);
            this.testActor.onMoveTo(ret);
        }
    }
}