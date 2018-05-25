namespace pomelo {
	var DBG_NETFLOW = true;
	export class PomeloClient extends egret.EventDispatcher {
		public static TYPE_STRING = 'sioconnector';
		public static TYPE_BINARY = 'hybridconnector';

		public static EVENT_CONNECT = 'pomeloEventConnect';
		public static EVENT_CLOSE = 'pomeloEventClose';
		public static EVENT_ERROR = 'pomeloEventError';
		public static EVENT_KICK = 'pomeloEventKick';

		public static TYPE_WSS = "wss://";
		public static TYPE_WS = "ws://"
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
		private _handlers: { [reqId: number]: Function } = {};
		private _ons = {};
		private _on_all: Function;
		/**message包 为消息头 */
		private _message: Message;
		private _package: Package;

		private _disconnect_flag = false;
		private _proc_ls: any[];
		private _heartTimer: egret.Timer;
		constructor() {
			super();
			this._ons = {};
		}
		public init(params: any, cb: Function = null) {
			this._message = new Message();
			this._package = new Package();
			this._initCb = cb;
			this._connecting = true;
			this.initWebSocket(params);
		}
		initWebSocket(params: any) {
			this._socket = new egret.WebSocket();
			this._recvCache = new egret.ByteArray();

			this._type = params.type || PomeloClient.TYPE_BINARY;
			if (this._type == PomeloClient.TYPE_STRING) {
				this._socket.type = egret.WebSocket.TYPE_STRING;
				throw new Error('暂不支持SOCKETIO的通讯协议');
			}
			else {
				this._socket.type = egret.WebSocket.TYPE_BINARY;
			}
			this._socket.addEventListener(egret.Event.CONNECT, this.onConnect, this);
			this._socket.addEventListener(egret.Event.CLOSE, this.closeConnect, this);
			this._socket.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onError, this);
			this._socket.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.onSocketData, this);
			try {
				let chttps = params.https ? PomeloClient.TYPE_WSS : PomeloClient.TYPE_WS;
				let url = chttps + params.host + ":" + params.port;
				this._socket.connectByUrl(chttps);
			}
			catch (e) {
				egret.error(e);
				var event = new egret.Event(egret.IOErrorEvent.IO_ERROR);
				this.onError(event);
			}
		}
		private handShakeData = {
			'sys': {
				'version': PomeloClient.JS_WS_CLIENT_VERSION,
				'type': PomeloClient.JS_WS_CLIENT_TYPE
			},
			'user': {
				// any customized request data
			}
		}
		private _send_size = 0;

		private send(bytes: egret.ByteArray) {
			if (this._socket) {
				this._socket.writeBytes(bytes, 0, bytes.length);
				this._send_size += bytes.length;
				try {
					this._socket.flush();
					if (DBG_NETFLOW) {
						console.info('* sent ' + this._send_size + ' bytes');
					}
					this._send_size = 0;
				} catch (e) {
					egret.error(e);
					var event = new egret.Event(egret.IOErrorEvent.IO_ERROR);
					this.onError(event);
				}
			}
		}

		onRequest(route:any,msg:{},cb:Function){
			if(this._socket && this._socket.connected){
				let reqId = ++PomeloClient._reqId;
				console.group("request: "+reqId);
				console.log(route);
				console.log(msg);
				console.groupEnd();
				this._handlers[reqId] = cb;
				msg = msg || {};
				var m = this._message.encode(MessageType.Request, reqId, route, msg);
				this.send(this._package.encode(PackageType.Data, m.length, m, 0));
			}
			else{
				egret.error('Socket is not connected.');
			}
		}
		onNotify(route:string,msg:any){
			console.group("Notify");
			console.log(route);
			console.log(msg);
			console.groupEnd();
			msg = msg || {};
			var m = this._message.encode(MessageType.Notify, -1, route, msg);
			this.send(this._package.encode(PackageType.Data, m.length, m, 0));
		}

		onConnect(e: egret.Event) {
			console.group("onConnect ***");
			console.info("send handShake");
			console.groupEnd();
			let handshakeStr = JSON.stringify(this.handShakeData);
			let bytes = new egret.ByteArray();
			bytes.writeUTFBytes(handshakeStr);
			this.send(this._package.encode(PackageType.Handshake, bytes.length, bytes, 0));
			this.dispatchEventWith(PomeloClient.EVENT_CONNECT);
		}
		closeConnect(e: egret.Event) {
			console.info('** connection closed');
			if( this._connecting ) {
				if( this._initCb ) {
					this._initCb(false);
					this._initCb = null;
				}
				this._connecting = false;
			}
			this.stopHeartBeat();
			this.dispatchEventWith(PomeloClient.EVENT_CLOSE);
		}
		onError(e: egret.IOErrorEvent) {
			console.info('** connection error');
			if( this._connecting ) {
				if( this._initCb ) {
					this._initCb(false);
					this._initCb = null;
				}
				this._connecting = false;
			}
			this.disconnect();
			this.dispatchEventWith(PomeloClient.EVENT_ERROR);
		}
		disconnect(){
			if( this._socket && this._socket.connected ) {
				this._socket.close();
				this._socket = null;
				this._package = null;
				this._message = null;
				this._recvCache = null;
				this._handlers = {};
			}
			this.stopHeartBeat();
			this._disconnect_flag = true;
		}
		onSocketData(e: egret.ProgressEvent) {
			if (this._socket) {
				let length_before = this._recvCache.length;
				this._socket.readBytes(this._recvCache, this._recvCache.length);
				if (DBG_NETFLOW) {
					let recv_size = this._recvCache.length - length_before;
					if (recv_size > 0) {
						console.info('* recv ' + recv_size + ' bytes');
					}
				}
				this.recvPackage();
			}
		}
		processMsg(msg: { type?: number, msgId?: number, route?: string, msg: {} }) {
			switch(msg.type){
				case MessageType.Request:{
					//服务器是不会发送request的
					egret.error('unexpected message type:', msg.type);
					break;
				}
				case MessageType.Notify:{
					egret.error('unexpected message type:', msg.type);
					//服务器是不会发送Notify的
					break;
				}
				case MessageType.Response:{
					console.group("Response: "+msg.msgId);
					console.log(msg.msg);
					console.groupEnd();
					if(this._handlers[msg.msgId]){
						this._handlers[msg.msgId](msg.msg);
						delete this._handlers[msg.msgId];
					}
					else{
						egret.error("no handler Response",msg.msgId);
					}
					break;
				}
				case MessageType.Push:{
					console.group("Push: "+msg.route);
					console.log(msg.msg);
					console.groupEnd();
					if(this._ons[msg.route]){
						this._ons[msg.route](msg.msg);
					}
					else{
						egret.error("no handle Push",msg.route);
					}
					break;
				}
				
			}
		}
		/**发送心跳包 */
		private sendHeartBeat() {
			this.send(this._package.encode(PackageType.Heartbeat,0,null,0))
		}
		private stopHeartBeat() {
			if (this._heartTimer) {
				this._heartTimer.stop();
				this._heartTimer.removeEventListener(egret.TimerEvent.TIMER,this.sendHeartBeat,this);
				this._heartTimer = null;
			}
		}
		processPkg(pkg: { type?: number, length?: number, body?: egret.ByteArray }) {
			switch (pkg.type) {
				case PackageType.Handshake: {
					if (pkg.body) {
						let handShake = JSON.parse(pkg.body.readUTFBytes(pkg.length));
						this._message.setRouteDic(handShake.sys.dict);
						if (handShake.code == 200) {
							this.stopHeartBeat();
							this._heartTimer = new egret.Timer(handShake.sys.heartbeat * 1000, 0);
							this._heartTimer.addEventListener(egret.TimerEvent.TIMER,this.sendHeartBeat,this);
							this._heartTimer.start();
							//发送确认包
							this.send(this._package.encode(PackageType.HandshakeAck,0,null,0))
						}
						else{
							this.disconnect();
						}
					}
					break;
				}
				case PackageType.HandshakeAck: {
					//服务器不会发送握手确认协议 不做任何处理
					break;
				}
				case PackageType.Heartbeat: {
					//心跳包 不做任何处理
					break;
				}
				case PackageType.Data: {
					//数据包
					let msg = this._message.decode(pkg.body,pkg.length);
					this.processMsg(msg);
					break;
				}
				case PackageType.Kick: {
					//被踢出了
					egret.warn('remote kicked gracefully :)');
					this._disconnect_flag = true;
					var event = new egret.Event(PomeloClient.EVENT_KICK);
					this.dispatchEvent(event);
					break;
				}
			}
		}
		recvPackage() {
			while (this._recvCache.bytesAvailable >= 4) {
				let read_position = this._recvCache.position;
				let pkg = this._package.decode(this._recvCache, this._recvCache.position);
				if (pkg) {
					this.processPkg(pkg);
				}
				else {
					this._recvCache.position = read_position;
					break;
				}
			}
			if (this._recvCache.bytesAvailable == 0) {
				this._recvCache.clear();
			}
			else {
				console.info('** incomplete package');
			}
		}
		doTest() {
			var ret = new egret.ByteArray();

		}
	}
}