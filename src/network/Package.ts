namespace pomelo {
    export enum PackageType {
        Handshake = 1,
        HandshakeAck = 2,
        Heartbeat = 3,
        Data = 4,
        Kick = 5
    }
    /**
   * Package protocol encode.
   *
   * Pomelo package format:
   * +------+-------------+------------------+
   * | type | body length |       body       |
   * +------+-------------+------------------+
   *
   * Head: 4bytes
   *   0: package type,
   *      1 - handshake,
   *      2 - handshake ack,
   *      3 - heartbeat,
   *      4 - data
   *      5 - kick
   *   1 - 3: big-endian body length
   * Body: body length bytes
   *
   * @param  {Number}    type   package type
   * @param  {ByteArray} body   body content in bytes
   * @return {ByteArray}        new byte array that contains encode result
   */
    export class Package {
        lengthByte:egret.ByteArray;
        constructor(){
            this.lengthByte = new egret.ByteArray();
        }
        encode(
            type: number,
            length: number,
            body: egret.ByteArray,
            bodyOffset: number
        ): egret.ByteArray {
            let ret = new egret.ByteArray();
            ret.writeByte(type);
            this.lengthByte.clear();
            this.lengthByte.writeUnsignedInt(length);
            ret.writeBytes(this.lengthByte,1,3);
            if(body){
                ret.writeBytes(body,bodyOffset,length);
            }
            return ret;
        }
        decode(
            bytes:egret.ByteArray, 
            offset: number = 0
        ) {
            let ret:{type?:number,length?:number,body?:egret.ByteArray} = {};
            bytes.position = offset;
            let type = bytes.readUnsignedByte();
            let len1 = bytes.readUnsignedByte();
			let len2 = bytes.readUnsignedByte();
			let len3 = bytes.readUnsignedByte();
            let length = len1 << 16 | len2 << 8 | len3;
            ret.type = type;
            ret.length = length; 
            if(bytes.bytesAvailable > length){
                ret.body = bytes;
            }
            else{
                ret.body = null;
            }
            return ret;
        }
    }
}