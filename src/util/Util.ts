namespace cutil{
     var _itoaStr = ['', 'K', 'M', 'B', 'C'];
    var _big = Math.pow(10,6);
    var _small = Math.pow(10,3);
    export function itoa(num: number) {
        let numStr = num + "";
        let count = 0;
        while (num > _big) {
            num = Math.floor(num / _small);
            count++;
            if (count == _itoaStr.length - 1) {
                break;
            }
        }
        let list:number[] = [];
        while(num > _small){
            list.push(num % _small);
            num = Math.floor(num / _small);
        }
        let ret = "";
        ret += num;
        for(let i = list.length -1;i>=0;i--){
            ret += "," + list[i];
        }
        return ret + _itoaStr[count];
    }
}