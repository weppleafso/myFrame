// TypeScript file
namespace ctest{
    export class MyTestView extends cui.View{
        constructor(){
            super({
                layer:cui.layer.base,
                mask:true,
                skin:"skins.ButtonSkin"
            });
        }
        onCreate(){
            this.addChild(new clib.MovieClip("bird"));
        }
        onDestroy(){

        }
    }
}