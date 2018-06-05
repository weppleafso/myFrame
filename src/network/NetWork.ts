namespace clib{
    export class NetWork extends egret.EventDispatcher{
        private _pomelo:pomelo.PomeloClient;
        private _connected:boolean = false;
        constructor(){
            super();
            this._pomelo = new pomelo.PomeloClient();
        }
        /**
         * 建立服务器连接
         */
        connect(host:string,port:number,callBack:Function,thisObject:any){
            this.disconnect();
            this._pomelo.init({
                host: host,
                port: port,
            },(success:boolean)=>{
                console.log('** network connected');
                this._connected = true;
                callBack.call(thisObject, success);
            })
        }
        /**
         * 断开服务器连接
         */
        disconnect() {
            if (this._connected) {
                console.log('** network disconnect');
                this._pomelo.disconnect();
                this._connected = false;
            }
        }

        request(route:string,msg:{},callBack:Function,thisObject:any){
            if(this._connected){
                this._pomelo.onRequest(route,msg,()=>{
                    callBack.call(thisObject);
                })
            }
        }
    }
    export var netWork:NetWork;
    
}