class Vec2 {
    public x: number;
    public y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    copy(): Vec2 {
        let obj = new Vec2(this.x, this.y);
        return obj;
    }
    get len(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    get angle(): number {
        return Math.atan2(this.y, this.x);
    }
    opMutiRadio(radio){
        this.x *= radio;
        this.y *= radio;
    }
    opSub(v:Vec2){
        this.x -= v.x;
        this.y -= v.y;
    }
    opAdd(v:Vec2){
        this.x += v.x;
        this.y += v.y;
    }
    opEqual(v:Vec2){
        return this.x == v.x
    }
    opSimilarEqual(v:Vec2,similar = 2.3e-16){
        let dt = (this.x - v.x);
        let dy = (this.y - v.y);
        return dt + dy < similar * 2;
    }

    static zero(): Vec2 {
        let obj = new Vec2(0, 0);
        return obj;
    }
    static one(): Vec2 {
        let obj = new Vec2(1, 1);
        return obj;
    }
    static oneX(): Vec2 {
        let obj = new Vec2(1, 0);
        return obj;
    }
    static oneY(): Vec2 {
        let obj = new Vec2(0, 1);
        return obj;
    }

    static equal(v1: Vec2, v2: Vec2): boolean {
        return v1.x == v2.x && v1.y == v2.y;
    }
    static distance(v1: Vec2, v2: Vec2): number {
        let dx = v1.x - v2.x;
        let dy = v1.y - v2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static add(v1: Vec2, v2: Vec2): Vec2 {
        let ret = new Vec2(v1.x + v2.x, v1.y + v2.y);
        return ret;
    }
    static dot(v1: Vec2, v2: Vec2): number {
        let ret = v1.x * v2.x + v1.y * v2.y;
        return ret;
    }

    static sub(v1: Vec2, v2: Vec2): Vec2 {
        let ret = new Vec2(v1.x - v2.x, v1.y - v2.y);
        return ret;
    }

    static radio(v1: Vec2, radio: number): Vec2 {
        return new Vec2(v1.x * radio, v1.y * radio);
    }
    static fromAngle(v1:Vec2,v2:Vec2):number{
        let dot = Vec2.dot(v1,v2);
        return Math.acos(dot/(v1.len * v2.len));
    }




}