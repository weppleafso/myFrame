namespace battle {
    /**点 */
    export class PathPoint {
        id: string;
        links: { [id: number]: number };
        private _vpos: Vec2;
        arenaIds: number;
        constructor(x: number, y: number) {
            this.id = x + "_" + y;
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
        h: number;
        f: number;
        g: number;
        parent: PathPoint;
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
        openDic: { [id: string]: PathPoint };
        close: { [x_y: string]: boolean };
        /**格子大小 */
        box: number;

        blocks: BlockObject[];
        points: PathPoint[];

        map: number[][];
        maxRow: number;
        maxColumn: number;

        cost: number;
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
                else {
                    for (let i = row2; i < row1; i++) {
                        let endCol = beginCol + tan;
                        this.setUnReach(i, Math.floor(beginCol), Math.floor(endCol));
                        beginCol = endCol;
                    }
                }

            }

        }
        setUnReach(row, column0, column1) {
            let min = Math.min(column0, column1);
            let max = Math.max(column0, column1);
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
        calculatePath(from: Vec2, to: Vec2) {
            this.open = [];
            this.openDic = {};
            this.close = {};
            let p0 = new Vec2(Math.floor(from.x / this.box), Math.floor(from.y / this.box));
            let p1 = new Vec2(Math.floor(to.x / this.box), Math.floor(to.y / this.box));
            let g = 0;
            let h = Math.abs(p0.x - p1.x) + Math.abs(p0.y - p1.y);
            let f = g + h;
            let parent = null;
            this.insertOpen(p0.x, p0.y, f, g, h, parent);
            let last: PathPoint = null;
            let dirs = [[1, 0, 1], [1, 1, 1.41], [0, 1, 1], [-1, 1, 1.41], [-1, 0, 1], [-1, -1, 1.41], [0, -1, 1], [1, -1, 1.41]];
            while (this.open.length != 0) {
                //八方向 取出一个
                let point = this.open.shift();
                delete this.openDic[point.id];
                for (let i = 0; i < dirs.length; i++) {
                    let [x, y, cost] = dirs[i];
                    x += point.vpos.x;
                    y += point.vpos.y;
                    if(x < 0 || x >= this.maxRow){
                        continue;
                    }
                    if(y < 0 || y >= this.maxColumn){
                        continue;
                    }
                    if (this.close[x + "_" + y]) {
                        continue;
                    }
                    if(this.map[x][y] == -1){
                        continue;
                    }
                    let g = point.g + cost;
                    let h = Math.abs(x - p1.x) + Math.abs(y - p1.y);
                    let f = g + h;
                    let parent = point;
                    let retPoint = this.insertOpen(x, y, f, g, h, parent);
                    if (retPoint && retPoint.vpos.opEqual(p1)) {
                        if (last == null) {
                            last = retPoint;
                        }
                        if (retPoint.f < last.f) {
                            last = retPoint;
                        }
                    }
                }
                this.close[point.id] = true;
            }
            let seek = last;
            let road: Vec2[] = [];
            while (seek != null) {
                seek.vpos.opMutiRadio(this.box)
                road.push(seek.vpos);
                seek = seek.parent;
            }
            road = road.reverse();
            return road;
        }
        insertOpen(x: number, y: number, f: number, g: number, h: number, parent: PathPoint) {
            let id = x + "_" + y;
            let p = this.openDic[id];
            if (p != null) {
                if (p.f > f) {
                    let index = this.open.indexOf(p);
                    this.open.splice(index, 1);
                }
                else{
                    return null;
                }
            }
            else {
                p = new PathPoint(x, y);
            }
            p.f = f;
            p.g = g;
            p.h = h;
            p.parent = parent;
            
            this.openDic[id] = p;
            if (this.open.length > 0) {
                let begin = 0;
                let end = this.open.length - 1;
                while(begin < end){
                    let mid = Math.floor((begin + end) / 2);
                    let midP = this.open[mid];
                    if(midP.f == p.f){
                        end = mid;
                        break;
                    }
                    else{
                        if(midP.f < p.f){
                            begin = mid + 1;
                        }
                        else{
                            end = mid;
                        }
                    }
                }
                let point = this.open[end];
                if (point.f > p.f) {
                    this.open.splice(end, 0, p);
                }
                else {
                    this.open.splice(end + 1, 0, p);
                }
            }
            else {
                this.open.push(p);
            }
            return p;
        }
    }
}