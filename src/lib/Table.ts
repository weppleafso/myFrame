namespace ctable{
    
    var tableData:any;
    export function getFromTable<CTYPE>(name:string,id:any):CTYPE{
        if(tableData[name]){
            return tableData[name][id];
        }
        return null;
    }

    export function getFromTableGroup<CTYPE>(name:string,group:any,id:any):CTYPE{
        if(tableData[name]){
            if(tableData[name][group]){
                return tableData[name][group][id];
            }
        }
        return null;
    }
    export function getTable(name:string){
        return tableData[name];
    }

    export function getTableGroup(name:string,group:any){
        if(tableData[name]){
            return tableData[name][group];
        }
        return null;
    }
    export function initTable(){
        
    }
}