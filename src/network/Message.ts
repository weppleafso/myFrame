namespace pomelo {
    export enum MessageType {
        Request = 0,
        Notify = 1,
        Response = 2,
        Push = 3
    }
    /**
 * Message protocol encode.
 *
 * @param  {Number} msgId            message id
 * @param  {Number} type          message type
 * @param  {Number} compressRoute whether compress route
 * @param  {Number|String} route  route code or route string
 * @param  {Buffer} msg           message body bytes
 * @return {Buffer}               encode result
 */
    export class Message {
        compressRoute: number = 0;
        useProtobuff: boolean = false;
        static MSG_ROUTE_MAX_LENGTH = 255;
        route_dicionary: { [route: string]: number };
        route_num_dict: { [routeId: number]: string };
        constructor() {

        }
        setRouteDic(dict:{}){
            if(dict){
                this.compressRoute = 1;
                this.route_dicionary = {};
                this.route_num_dict = {};
                for(let route in dict){
                    this.route_dicionary[route] = dict[route];
                    this.route_num_dict[dict[route]] = route;
                }
            }
            else{
                this.compressRoute = 0;
            }
        }
        encodeMsgId(bytes: egret.ByteArray, msgId: number) {
            do {
                let num = msgId & 0x7F;
                let next = msgId >> 7;
                if (next !== 0) {
                    num = num | 0x80;
                }
                bytes.writeByte(num)
                msgId = next;
            } while (msgId !== 0);
        }
        decodeMsgId(bytes: egret.ByteArray) {
            let ret = 0;
            let i = 0;

            do {
                var num = bytes.readUnsignedByte();
                ret += (num & 0x7F) * Math.pow(2, 7 * i);
                i++;
            } while (num > 128)
            return {
                msgId: ret,
                len: i
            }
        }
        decode(bytes: egret.ByteArray, length: number) {
            let left = length;
            let type = bytes.readUnsignedByte();
            let compressRoute = type & 0x01;
            type = type >> 1;
            left--;
            let ret = this.decodeMsgId(bytes);
            let msgId = ret.msgId;
            left -= ret.len;
            var route = null;
            //Response 没有路由路径
            if (type != MessageType.Response) {
                if (compressRoute) {
                    let routeId = bytes.readUnsignedByte() << 8 + bytes.readUnsignedByte();
                    left -= 2;
                    route = this.route_num_dict[routeId];
                    if (!route) {
                        egret.error("routeId no exist!", routeId);
                    }
                }
                else {
                    let length = bytes.readUnsignedByte();
                    route = bytes.readUTFBytes(length);
                    left -= length + 1;
                }
            }
            let msgStr = bytes.readUTFBytes(left);
            let msg = null;
            try {
                if (needWebkitWorkaround) {
                    msg = JSON.parse(msgStr, stripNaN);
                }
                else {
                    msg = JSON.parse(msgStr);
                }
            }
            catch(e){
                msg = null;
            }
            
            return {
                type,
                msgId,
                route,
                msg
            }

        }
        encode(type: number, msgId: number, route: string, msg: {}) {
            let ret = new egret.ByteArray();
            ret.writeByte(type << 1 | this.compressRoute);
            if (msgId > 0) {
                this.encodeMsgId(ret, msgId);
            }
            if (this.compressRoute) {
                let routeId = this.route_dicionary[route];
                if (routeId) {
                    ret.writeByte((routeId & 0xff00) >> 8);
                    ret.writeByte(routeId & 0xff);
                }
                else {
                    egret.error("route no in route_dicionary-->", route);
                }
            }
            else {
                let routeBuff = new egret.ByteArray();
                routeBuff.writeUTFBytes(route);
                if (routeBuff.length > Message.MSG_ROUTE_MAX_LENGTH) {
                    egret.error('Pomelo.Message: Maximum route length exceed.');
                }
                ret.writeByte(routeBuff.length);
                ret.writeBytes(routeBuff);
            }
            if (this.useProtobuff) {

            }
            else {
                let str = JSON.stringify(msg);
                /**todo 字符压缩？ */
                ret.writeUTFBytes(str);
            }
            return ret;

        }
    }
    /**
	 * work around for webkit bug
	 */
    var needWebkitWorkaround = (function () {
        var tester = JSON.parse('{"1071":12291.8,"1074":3}');
        for (var k in tester) {
            if (isNaN(tester[k])) {
                return true;
            }
        }
        return false;
    })();

    function stripNaN(k, v) {
        if (typeof v == "number" && isNaN(v)) {
            return void 0;
        }
        return v;
    }
}