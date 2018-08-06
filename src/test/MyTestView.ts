// TypeScript file
namespace ctest{
    export class MyTestView extends cui.View{
        testActor:battle.Actor;
        gpMap:eui.Group;
        shape:egret.Shape;
        pathFinder:battle.PathFinder;
        btnMusic:eui.Button;
        btnEffect:eui.Button;
        imgBg:eui.Image;
        constructor(){
            super({
                layer:cui.layer.base,
                mask:true,
                skin:"MyTestView"
            });
        }
        protected createChildren(){
            super.createChildren();
            
        }
        onChangeMusic(){
            let renderTextrue = new egret.RenderTexture();
            renderTextrue.drawToTexture(this.imgBg);
            renderTextrue.toDataURL("image/png");
            return ;
            let list = ["homepage_bgm_mp3","comic_bgm_mp3"];
            let i = Math.floor(Math.random() * list.length);
            let res = list[i];
            clib.sound.playMusic(res,true);
        }
        onChangeEffect(){
            let list = ["box_push_mp3","click_mp3","code_error_mp3"];
            let i = Math.floor(Math.random() * list.length);
            let res = list[i];
            clib.sound.playEffect(res,true);
        }
        onCreate(){
            this.shape = new egret.Shape();
            this.addChildAt(this.shape,0);
            clib.sound.playMusic("comic_bgm_mp3",true);
            this.gpMap.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTap,this);
            this.btnMusic.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onChangeMusic,this);
            this.btnEffect.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onChangeEffect,this);
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
            // clib.useCache(battle.TestActor,function(obj:battle.TestActor,a:number){
            //     console.log(a);
            // })
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