namespace pomelo{
    export class PomeloClient extends egret.EventDispatcher{
        public static TYPE_JSON = 'sioconnector';
		public static TYPE_BINARY = 'hybridconnector';

		public static EVENT_CONNECT = 'pomeloEventConnect';
		public static EVENT_CLOSE = 'pomeloEventClose';
		public static EVENT_ERROR = 'pomeloEventError';
		public static EVENT_KICK = 'pomeloEventKick';
		public static _reqId = 0;

        /*** IMPLEMENT ***/

		private static JS_WS_CLIENT_TYPE = 'js-websocket';
  		private static JS_WS_CLIENT_VERSION = '0.0.1';
  		private static RES_OK = 200;
  		private static RES_FAIL = 500;
  		private static RES_OLD_CLIENT = 501;

        private _type: string = PomeloClient.TYPE_BINARY;
		private _socket: egret.WebSocket = null;
		private _initCb: Function = null;
		private _connecting: boolean;//is connectting
		private _recvCache: egret.ByteArray;
        /**
         * 保存消息的回调列表
        */
		private _handlers:{[reqId:number]:Function} = {};
		private _ons = {};
		private _on_all: Function;
        /**message包 为消息头 */
		private _message: Message;
		private _package: Package;
		
		private _disconnect_flag = false;
		private _proc_ls: any[];
		private _heartTimer:egret.Timer;
        constructor(){
            super();
        }
        doTest(){
            var ret = new egret.ByteArray();
            
        }
    }
}