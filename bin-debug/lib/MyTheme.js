var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MyTheme = (function (_super) {
    __extends(MyTheme, _super);
    function MyTheme(configURL, stage) {
        var _this = _super.call(this, configURL, stage) || this;
        var HOST_COMPONENT = "hostComponent";
        var SKIN_CLASS = "eui.Skin";
        var DECLARATIONS = "Declarations";
        var RECTANGLE = "egret.Rectangle";
        var TYPE_CLASS = "Class";
        var TYPE_ARRAY = "Array";
        var TYPE_PERCENTAGE = "Percentage";
        var TYPE_STATE = "State[]";
        var SKIN_NAME = "skinName";
        var ELEMENTS_CONTENT = "elementsContent";
        var basicTypes = [TYPE_ARRAY, "boolean", "string", "number"];
        var wingKeys = ["id", "locked", "includeIn", "excludeFrom"];
        var htmlEntities = [["<", "&lt;"], [">", "&gt;"], ["&", "&amp;"], ["\"", "&quot;"], ["'", "&apos;"]];
        var jsKeyWords = ["null", "NaN", "undefined", "true", "false"];
        function toXMLString(node) {
            if (!node) {
                return "";
            }
            var str = "  at <" + node.name;
            var attributes = node.attributes;
            var keys = Object.keys(attributes);
            var length = keys.length;
            for (var i = 0; i < length; i++) {
                var key = keys[i];
                var value = attributes[key];
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
            var stringValue = value; //除了字符串，其他类型都去除两端多余空格。
            value = value.trim();
            var className = this.getClassNameOfNode(node);
            // let type: string = eui.sys.exmlConfig.getPropertyType(key, className);
            var type;
            if (key == 'itemRendererSkinName') {
                type = 'any';
            }
            else {
                type = eui.sys.exmlConfig.getPropertyType(key, className);
            }
            if (true && !type) {
                egret.$error(2005, this.currentClassName, key, toXMLString(node));
            }
            var bindingValue = this.formatBinding(key, value, node);
            if (bindingValue) {
                this.checkIdForState(node);
                var target = "this";
                if (node !== this.currentXML) {
                    target += "." + node.attributes["id"];
                }
                this.bindings.push(new eui.sys.EXBinding(target, key, bindingValue.templates, bindingValue.chainIndex));
                value = "";
            }
            else if (type == RECTANGLE) {
                if (true) {
                    var rect = value.split(",");
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
                var orgValue = value;
                switch (type) {
                    case TYPE_CLASS:
                        if (key == SKIN_NAME) {
                            value = this.formatString(stringValue);
                        }
                        break;
                    case "number":
                        if (value.indexOf("#") == 0) {
                            if (true && isNaN(value.substring(1))) {
                                egret.$warn(2021, this.currentClassName, key, value);
                            }
                            value = "0x" + value.substring(1);
                        }
                        else if (value.indexOf("%") != -1) {
                            if (true && isNaN(value.substr(0, value.length - 1))) {
                                egret.$warn(2021, this.currentClassName, key, value);
                            }
                            value = (parseFloat(value.substr(0, value.length - 1))).toString();
                        }
                        else if (true && isNaN(value)) {
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
                        if (true) {
                            egret.$error(2008, this.currentClassName, "string", key + ":" + type, toXMLString(node));
                        }
                        break;
                }
            }
            return value;
        };
        return _this;
    }
    MyTheme.registerThemeAdapter = function (stage) {
        var adpater = new ThemeAdapter();
        stage.registerImplementation("eui.IThemeAdapter", adpater);
        MyTheme.themeAdapter = adpater;
    };
    MyTheme.hack = function () {
        var oldParseSkinName = eui.Component.prototype.$parseSkinName;
        eui.Component.prototype.$parseSkinName = function () {
            var skinName = this.skinName;
            var skin;
            if (skinName) {
                if (skinName.prototype) {
                    skin = new skinName();
                }
                else if (typeof (skinName) == "string") {
                    var clazz = void 0;
                    var text = skinName.trim();
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
        };
    };
    MyTheme.loadSkin = function (skinName) {
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
    };
    MyTheme.request = function (url, callback) {
        var openUrl = url;
        if (url.indexOf("://") == -1) {
            openUrl = EXML.prefixURL + url;
        }
        var onConfigLoaded = function (str) {
            if (!str) {
                str = "";
            }
            callback(url, str);
        };
        var adapter = MyTheme.themeAdapter;
        if (!adapter) {
            adapter = new eui.DefaultThemeAdapter();
        }
        adapter.getTheme(openUrl, onConfigLoaded, onConfigLoaded, this);
    };
    MyTheme.loadedExmlDict = {};
    MyTheme.loadedExmlDict2 = {};
    MyTheme.eval = window["eval"];
    MyTheme.myEval = function (text) {
        return MyTheme.eval(text);
    };
    return MyTheme;
}(eui.Theme));
__reflect(MyTheme.prototype, "MyTheme");
MyTheme.prototype["onConfigLoaded"] = function (str) {
    var _this = this;
    if (str) {
        if (true) {
            try {
                var data = JSON.parse(str);
            }
            catch (e) {
                egret.$error(3000);
            }
        }
        else {
            var data = JSON.parse(str);
        }
    }
    else if (true) {
        egret.$error(3000, this.$configURL);
    }
    else {
        return;
    }
    if (data && data.skins) {
        var skinMap = this.skinMap;
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
        data.exmls.forEach(function (exml) { return EXML.$parseURLContentAsJs(exml.path, exml.gjs, exml.className); });
        this.onLoaded();
    }
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
        var exmls = data.exmls;
        var loadedExmlCnt = 0;
        var loadedExmlDict = {};
        var loadedExmlDict2 = {};
        for (var j in exmls) {
            var url = exmls[j];
            MyTheme.request(url, function (url, text) {
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
                            _this.onLoaded();
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
//# sourceMappingURL=MyTheme.js.map