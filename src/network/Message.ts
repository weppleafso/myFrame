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
        compressRoute:number = 0;
        constructor(){
            
        }
        encodeMsgId(){
        }
        decode(){

        }
        encode(type:number,msgId:number,route:string,msg:string){
            let ret = new egret.ByteArray();
            ret.writeByte(type << 1 | this.compressRoute);
            if(type == MessageType.Request || type == MessageType.Response){
                // ret.writeByte()
            }
        }
    }
}