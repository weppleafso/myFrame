namespace battle{
    /**点 */
    export class PathPoint{
        id:number;
        links:{[id:number]:number};
        private _vpos:Vec2;
        arenaIds:number;
        constructor(id,x:number,y:number){
            this.id
            this._vpos = new Vec2(x,y);
            this.links = [];
        }
        get vpos():Vec2{
            return this._vpos;
        }
        set vpos(v:Vec2){
            this._vpos.x = v.x;
            this._vpos.y = v.y;
        }
        setPos(x:number,y:number){
            this._vpos.x = x;
            this._vpos.y = y;
        }
    }
    /**障碍物 */
    export class BlockObject{
        points:Vec2[];
        private _vpos:Vec2;
        constructor(){
            this._vpos = Vec2.zero();
            this.points = [];
        }
        addPoint(point:Vec2){
            this.points.push(point);
        }
        get vpos():Vec2{
            return this._vpos;
        }
        set vpos(v:Vec2){
            this._vpos.x = v.x;
            this._vpos.y = v.y;
        }
        setPos(x:number,y:number){
            this._vpos.x = x;
            this._vpos.y = y;
        }
    }
    /**这个类用于计算路径相关，采用区域+A*算法 区域判断是否可以从一个区域到另外一个区域（减少节点数量） 首先每个点都标记着一个区域，还要链接点的ID 以及需求的消耗*/
    class PathFinder{
        open:PathPoint[];
        close:PathPoint[];
        /**格子大小 */
        box:number;

        blocks:BlockObject[];
        points:PathPoint[];

        map:number[][];
        constructor(){
            this.blocks = [];
            this.points = [];
            this.box = 20;
        }
        init(){
            let b1 = new BlockObject();
            b1.setPos(100,100);
            b1.addPoint(new Vec2(0,0));
            b1.addPoint(new Vec2(0,100));
            b1.addPoint(new Vec2(100,100));
            b1.addPoint(new Vec2(100,0));
            this.blocks.push(b1);
        }
        initMap(){
            this.map = [];
            let width = director.instance.width;
            let height = director.instance.height;
            
        }
        anyliseBlock(block:BlockObject){

        }
        anyliseLine(p1:Vec2,p2:Vec2){

        }
    }
}