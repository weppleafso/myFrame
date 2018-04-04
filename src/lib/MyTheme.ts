class MyTheme extends eui.Theme {
    public static registerThemeAdapter(stage: egret.Stage) {
        var adpater = new ThemeAdapter();

        stage.registerImplementation("eui.IThemeAdapter", adpater);
        MyTheme.themeAdapter = adpater;
    }

    public static themeAdapter: ThemeAdapter;
    public static loadedExmlDict = {};
    public static loadedExmlDict2 = {};

    public static eval = window["eval"];
    public static myEval = function (text: string) {
        return MyTheme.eval(text);
    };

    public static theme: MyTheme;
    public constructor(configURL: string, stage?: egret.Stage) {
        super(configURL, stage);
        let HOST_COMPONENT = "hostComponent";
        let SKIN_CLASS = "eui.Skin";
        let DECLARATIONS = "Declarations";
        let RECTANGLE = "egret.Rectangle";
        let TYPE_CLASS = "Class";
        let TYPE_ARRAY = "Array";
        let TYPE_PERCENTAGE = "Percentage";
        let TYPE_STATE = "State[]";
        let SKIN_NAME = "skinName";
        let ELEMENTS_CONTENT = "elementsContent";
        let basicTypes: string[] = [TYPE_ARRAY, "boolean", "string", "number"];
        let wingKeys: string[] = ["id", "locked", "includeIn", "excludeFrom"];
        let htmlEntities: string[][] = [["<", "&lt;"], [">", "&gt;"], ["&", "&amp;"], ["\"", "&quot;"], ["'", "&apos;"]];
        let jsKeyWords: string[] = ["null", "NaN", "undefined", "true", "false"];
        function toXMLString(node: egret.XML): string {
            if (!node) {
                return "";
            }
            let str: string = "  at <" + node.name;
            let attributes = node.attributes;
            let keys = Object.keys(attributes);
            let length = keys.length;
            for (let i = 0; i < length; i++) {
                let key = keys[i];
                let value: string = attributes[key];
                if (key == "id" && value.substring(0, 2) == "__") {
                    continue;
                }
                str += " " + key + "=\"" + value + "\"";
            }
            if (node.children.length == 0) {
                str += "/>";
            }
            else {
                str += ">";
            }
            return str;
        }

        var oldFormatValue = eui.sys.EXMLParser.prototype['formatValue'];
        eui.sys.EXMLParser.prototype['formatValue'] = function (key, value, node) {
            if (!value) {
                value = "";
            }
            let stringValue = value;//除了字符串，其他类型都去除两端多余空格。
            value = value.trim();
            let className = this.getClassNameOfNode(node);
            // let type: string = eui.sys.exmlConfig.getPropertyType(key, className);
            let type: string;
            if (key == 'itemRendererSkinName') {
                type = 'any';
            }
            else {
                type = eui.sys.exmlConfig.getPropertyType(key, className);
            }
            if (DEBUG && !type) {
                egret.$error(2005, this.currentClassName, key, toXMLString(node));
            }
            let bindingValue = this.formatBinding(key, value, node);
            if (bindingValue) {
                this.checkIdForState(node);
                let target = "this";
                if (node !== this.currentXML) {
                    target += "." + node.attributes["id"];
                }
                this.bindings.push(new eui.sys.EXBinding(target, key, bindingValue.templates, bindingValue.chainIndex));
                value = "";
            }
            else if (type == RECTANGLE) {
                if (DEBUG) {
                    let rect = value.split(",");
                    if (rect.length != 4 || isNaN(parseInt(rect[0])) || isNaN(parseInt(rect[1])) ||
                        isNaN(parseInt(rect[2])) || isNaN(parseInt(rect[3]))) {
                        egret.$error(2016, this.currentClassName, toXMLString(node));
                    }
                }
                value = "new " + RECTANGLE + "(" + value + ")";
            }
            else if (type == TYPE_PERCENTAGE) {
                if (value.indexOf("%") != -1) {
                    value = this.formatString(value);
                    ;
                }
            }
            else {
                let orgValue: string = value;
                switch (type) {
                    case TYPE_CLASS:
                        if (key == SKIN_NAME) {
                            value = this.formatString(stringValue);
                        }
                        break;
                    case "number":
                        if (value.indexOf("#") == 0) {
                            if (DEBUG && isNaN(<any>value.substring(1))) {
                                egret.$warn(2021, this.currentClassName, key, value);
                            }
                            value = "0x" + value.substring(1);
                        }
                        else if (value.indexOf("%") != -1) {
                            if (DEBUG && isNaN(<any>value.substr(0, value.length - 1))) {
                                egret.$warn(2021, this.currentClassName, key, value);
                            }
                            value = (parseFloat(value.substr(0, value.length - 1))).toString();
                        }
                        else if (DEBUG && isNaN(<any>value)) {
                            egret.$warn(2021, this.currentClassName, key, value);
                        }
                        break;
                    case "boolean":
                        value = (value == "false" || !value) ? "false" : "true";
                        break;

                    case "string":
                    case "any":
                        value = this.formatString(stringValue);
                        break;
                    default:
                        if (DEBUG) {
                            egret.$error(2008, this.currentClassName, "string", key + ":" + type, toXMLString(node));
                        }
                        break;
                }
            }
            return value;
        };
    }

    public static hack() {
        var oldParseSkinName = eui.Component.prototype.$parseSkinName;

        eui.Component.prototype.$parseSkinName = function (): void {
            let skinName = this.skinName;
            let skin: any;
            if (skinName) {
                if (skinName.prototype) {
                    skin = new skinName();
                }
                else if (typeof (skinName) == "string") {
                    let clazz: any;
                    let text: string = skinName.trim();
                    if (text.charAt(0) == "<") {
                        clazz = EXML.parse(text);
                    }
                    else {
                        // clazz = egret.getDefinitionByName(skinName);
                        clazz = MyTheme.loadSkin(skinName);
                        if (!clazz && text.toLowerCase().indexOf(".exml") != -1) {
                            EXML.load(skinName, this.onExmlLoaded, this, true);
                            return;
                        }
                    }
                    if (clazz) {
                        skin = new clazz();
                    }
                }
                else {
                    skin = skinName;
                }
            }
            this.setSkin(skin);
        }
    }

    public static loadSkin(skinName: string): any {
        var paths = skinName.split('.');
        var info = MyTheme.loadedExmlDict[skinName];
        var ret = null;

        if (!info) {
            info = MyTheme.loadedExmlDict2[skinName];
        }

        if (info) {
            if (!info.parsed) {
                var evel = window["eval"];

                window["eval"] = MyTheme.myEval;

                var parser = new eui.sys.EXMLParser();

                var cls = parser.parse(info.content);

                window["eval"] = MyTheme.eval;

                if (cls == null) {
                    console.assert(false);
                }

                info.parsed = true;
                info.content = cls;
            }
            ret = info.content;
        }
        return ret;
    }

    public static request(url: string, callback: (url: string, text: string) => void) {
        var openUrl = url;
        if (url.indexOf("://") == -1) {
            openUrl = EXML.prefixURL + url;
        }

        var onConfigLoaded = function (str: string) {
            if (!str) {
                str = "";
            }
            callback(url, str);
        };

        var adapter: eui.IThemeAdapter = MyTheme.themeAdapter;

        if (!adapter) {
            adapter = new eui.DefaultThemeAdapter();
        }
        adapter.getTheme(openUrl, onConfigLoaded, onConfigLoaded, this);
    }
}
MyTheme.prototype["onConfigLoaded"] = function (str: string): void {
    if (str) {
        if (DEBUG) {
            try {
                var data = JSON.parse(str);
            }
            catch (e) {
                egret.$error(3000);
            }
        } else {
            var data = JSON.parse(str);
        }
    }
    else if (DEBUG) {
        egret.$error(3000, this.$configURL);
    }
    else {
        return;
    }


    if (data && data.skins) {
        var skinMap = this.skinMap
        var skins = data.skins;
        var keys = Object.keys(skins);
        var length = keys.length;
        for (var i = 0; i < length; i++) {
            var key = keys[i];
            if (!skinMap[key]) {
                this.mapSkin(key, skins[key]);
            }
        }
    }

    if (data.styles) {
        this.$styles = data.styles;
    }

    if (!data.exmls || data.exmls.length == 0) {
        this.onLoaded();
    }
    else if (data.exmls[0]['gjs']) {
        data.exmls.forEach((exml) => EXML.$parseURLContentAsJs((<any>exml).path, (<any>exml).gjs, (<any>exml).className));
        this.onLoaded();
    }
    // In release version, exml content is packaged in the theme file
    else if (data.exmls[0]['content']) {
        //        data.exmls.forEach((exml) => EXML.$parseURLContent((<EXMLFile>exml).path, (<EXMLFile>exml).content));
        var loadedExmlDict = {};
        var loadedExmlDict2 = {};
        var elements = data.exmls;
        var subStr = 'class="';

        MyTheme.loadedExmlDict = loadedExmlDict;
        MyTheme.loadedExmlDict2 = loadedExmlDict2;
        for (var k in elements) {
            var exml = elements[k];
            var url = exml.path;
            var text = exml.content;
            var index = text.indexOf(subStr);

            if (index >= 0) {
                var beginIndex = index + subStr.length;
                var endIndex = text.indexOf('"', beginIndex);

                if (endIndex >= 0) {
                    var className = text.substring(beginIndex, endIndex);

                    loadedExmlDict[className] = loadedExmlDict2[url] = {
                        content: text,
                    };
                }
                else {
                    console.assert(false);
                }
            }
            else {
                console.assert(false);
            }
        }
        this.onLoaded();
    }
    else {
        //        EXML.$loadAll(<string[]>data.exmls, this.onLoaded, this, true);

        var subStr = 'class="';
        var exmls = <string[]>data.exmls;
        var loadedExmlCnt = 0;
        var loadedExmlDict = {};
        var loadedExmlDict2 = {};

        for (var j in exmls) {
            var url = <any>exmls[j];

            MyTheme.request(url, (url: string, text: string) => {
                var index = text.indexOf(subStr);

                if (index >= 0) {
                    var beginIndex = index + subStr.length;
                    var endIndex = text.indexOf('"', beginIndex);

                    if (endIndex >= 0) {
                        var className = text.substring(beginIndex, endIndex);

                        loadedExmlDict[className] = loadedExmlDict2[url] = {
                            content: text,
                        };

                        ++loadedExmlCnt;
                        if (loadedExmlCnt == exmls.length) {
                            MyTheme.loadedExmlDict = loadedExmlDict;
                            MyTheme.loadedExmlDict2 = loadedExmlDict2;
                            this.onLoaded();
                        }
                    }
                    else {
                        console.assert(false);
                    }
                }
                else {
                    console.assert(false);
                }
            });
        }
    }
};
