namespace battle {
    /**点 */
    export class PathPoint {
        id: number;
        links: { [id: number]: number };
        private _vpos: Vec2;
        arenaIds: number;
        constructor(id, x: number, y: number) {
            this.id
            this._vpos = new Vec2(x, y);
            this.links = [];
        }
        get vpos(): Vec2 {
            return this._vpos;
        }
        set vpos(v: Vec2) {
            this._vpos.x = v.x;
            this._vpos.y = v.y;
        }
        setPos(x: number, y: number) {
            this._vpos.x = x;
            this._vpos.y = y;
        }
    }
    /**障碍物 */
    export class BlockObject {
        points: Vec2[];
        private _vpos: Vec2;
        constructor() {
            this._vpos = Vec2.zero();
            this.points = [];
        }
        addPoint(point: Vec2) {
            this.points.push(point);
        }
        get vpos(): Vec2 {
            return this._vpos;
        }
        set vpos(v: Vec2) {
            this._vpos.x = v.x;
            this._vpos.y = v.y;
        }
        setPos(x: number, y: number) {
            this._vpos.x = x;
            this._vpos.y = y;
        }
    }
    /**这个类用于计算路径相关，采用区域+A*算法 区域判断是否可以从一个区域到另外一个区域（减少节点数量） 首先每个点都标记着一个区域，还要链接点的ID 以及需求的消耗*/
    export class PathFinder {
        open: PathPoint[];
        close: PathPoint[];
        /**格子大小 */
        box: number;

        blocks: BlockObject[];
        points: PathPoint[];

        map: number[][];
        maxRow: number;
        maxColumn: number;
        constructor() {
            this.box = 20;
        }
        init() {
            this.blocks = [];
            this.points = [];
            let b1 = new BlockObject();
            b1.setPos(100, 100);
            b1.addPoint(new Vec2(0, 0));
            b1.addPoint(new Vec2(0, 100));
            b1.addPoint(new Vec2(100, 200));
            b1.addPoint(new Vec2(100, 0));
            this.blocks.push(b1);
            this.initMap();

        }
        initMap() {
            this.map = [];
            let width = director.instance.width;
            let height = director.instance.height;
            this.maxRow = Math.ceil(width / this.box);
            this.maxColumn = Math.ceil(height / this.box);
            for (let i = 0, ilen = this.maxRow; i < ilen; i++) {
                this.map[i] = [];
                for (let j = 0, jlen = this.maxColumn; j < jlen; j++) {
                    this.map[i][j] = 1;
                }
            }
            for (let i = 0, len = this.blocks.length; i < len; i++) {
                this.anyliseBlock(this.blocks[i]);
            }
        }
        anyliseBlock(block: BlockObject) {
            egret.log(egret.getTimer());
            for (var i = 0, len = block.points.length - 1; i < len; i++) {
                let p1 = Vec2.add(block.points[i], block.vpos);
                let p2 = Vec2.add(block.points[i + 1], block.vpos);
                this.anyliseLine(p1, p2);
            }
            let p1 = Vec2.add(block.points[i], block.vpos);
            let p2 = Vec2.add(block.points[0], block.vpos);
            this.anyliseLine(p1, p2);
            egret.log(egret.getTimer());

        }
        anyliseLine(p1: Vec2, p2: Vec2) {
            let dy = (p2.y - p1.y);
            let dx = (p2.x - p1.x);
            if (dx == 0) {
                let row0 = p1.x / this.box;
                let column0 = p1.y / this.box;
                let column3 = p2.y / this.box;
                this.setUnReach(Math.floor(row0), Math.floor(column0), Math.floor(column3));
            }
            else {
                let tan = (p2.y - p1.y) / (p2.x - p1.x);
                let y0 = p1.x;
                let y3 = p2.x;
                let column0 = p1.y / this.box;
                let column3 = p2.y / this.box;
                let row0 = p1.x / this.box;
                let row1 = Math.ceil(row0);
                let row3 = p2.x / this.box;
                let row2 = Math.floor(row3);
                let column1 = (row1 - row0) * tan + column0;
                let column2 = column3 - (row3 - row2) * tan;
                this.setUnReach(Math.floor(row0), Math.floor(column0), Math.floor(column1));
                this.setUnReach(Math.floor(row3), Math.floor(column2), Math.floor(column3));
                let beginCol = column1;
                if (dx > 0) {
                    for (let i = row1; i < row2; i++) {
                        let endCol = beginCol + tan;
                        this.setUnReach(i, Math.floor(beginCol), Math.floor(endCol));
                        beginCol = endCol;
                    }
                }
                else{
                    for (let i = row2; i < row1; i++) {
                        let endCol = beginCol + tan;
                        this.setUnReach(i, Math.floor(beginCol), Math.floor(endCol));
                        beginCol = endCol;
                    }
                }

            }

        }
        setUnReach(row, column0, column1) {
            let min = Math.min(column0,column1);
            let max = Math.max(column0,column1);
            for (let i = min; i <= max; i++) {
                this.map[row][i] = -1;
            }
        }
        drawRect(shape: egret.Shape) {
            let g = shape.graphics;
            g.clear();
            g.beginFill(0xff3030, 0.8);
            for (let x = 0; x < this.maxRow; x++) {
                for (let y = 0; y < this.maxColumn; y++) {
                    if (this.map[x][y] == -1) {
                        g.drawRect(x * this.box, y * this.box, this.box, this.box);
                    }
                }
            }
            g.endFill();
        }
    }
}