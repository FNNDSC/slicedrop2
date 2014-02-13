'use strict';

var Collaboration = function(db){
    this.db = db;
    this.tmp = {};
    this.tmp2 = {};
    this.status = {};
};

Collaboration.prototype.setup = function(){

        var _this = this;

        TogetherJS.hub.on('togetherjs.hello', function (msg) {
                    if (! msg.sameUrl) {
                        return;
                    }

                    _this.db.getAllDataItems(function(e){ _this.onsuccessSendAllDataItems(e); });
                  
                });

        TogetherJS.hub.on('dataSend', function (msg) {
                    if (! msg.sameUrl) {
                        return;
                    }

                    var CHUNK_SIZE = Math.pow(2, 16);
                    var str = msg.content;

                    // merge data
                    if(!_this.tmp.hasOwnProperty(msg.uid)){
                        // create container for this data!
                        //var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
                        _this.tmp[msg.uid] = {};

                        _this.status[msg.uid] = 0;
                        window.console.log("Create container: " + msg.uid + " - " + str.length);
                    }
                    window.console.log("size: " + str.length);
                    window.console.log("_this.status[msg.uid] : " + _this.status[msg.uid] );
                    window.console.log("msg.total : " + msg.total );

                    _this.status[msg.uid] += 1;
                    _this.tmp[msg.uid][msg.index]= str;
                    
                    if(_this.status[msg.uid] === msg.total){

                        var fullString = '';
                        var j = 0;
                        for(j = 0; j <=  msg.total; j++){
                            fullString += _this.tmp[msg.uid][j];
                        }

                        window.console.log("fullString: " + fullString.length);

                        var object2 = {name: msg.name,
                            size: '000',
                            file: null,
                            content:  str2ab(fullString),
                            uid: msg.uid };
                       
                        _this.db.addData(object2);

                        // clean tmp variables

                    }

    //                     var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    // var bufView = new Uint16Array(buf);
    // for (var i=0, strLen=str.length; i<strLen; i++) {
    //     bufView[i] = str.charCodeAt(i);
    // }
    
    // return buf;

                    // add it to DB when it is all there!

                    // var object2 = {name: msg.name,
                    //     size: '000',
                    //     file: null,
                    //     content: str2ab(msg.content),
                    //     uid: msg.uid };
                    // _this.db.addData(object2);
                });

    };

Collaboration.prototype.onsuccessSendAllDataItems = function(e) {
        var result = e.target.result;
        if(!!result == false){
            return;
        }

        // var buf = result.value.content;
        // var ab = new Uint16Array(result.value.content);
        // var length = ab.length;
        // // var array = result.value.size;

        // window.console.log("SEND DATA");
        // window.console.log(length);
        // // Uint8Array
        // var _array_type = Uint16Array;
        // var _chunkSize = 2;
        // // 100kB per message
        // var pack = 100000;
        // var index = 0;;

        // // for(index = 0; index >= length; index += pack){
        // //     window.console.log(index + '/' +length);
        // // }

        var ab = new Uint16Array(result.value.content);
        var abLen = ab.length;

        window.console.log("abLength: "+ abLen);
        var CHUNK_SIZE = Math.pow(2, 16);
        var offset, len, subab;
        var total = Math.ceil(abLen/CHUNK_SIZE);
        var index = 0;

        var fullString = '';
        for (offset = 0; offset < abLen; offset += CHUNK_SIZE) {
            len = Math.min(CHUNK_SIZE, abLen-offset);
            // subab = ab.subarray(offset, offset+len);
            var string = String.fromCharCode.apply(null,ab.subarray(offset, offset+len));
            window.console.log("index: " + index + "  size: " + string.length);
            TogetherJS.send({type: 'dataSend', name: result.value.name, content: string, uid: result.value.uid, total: total, index: index });
            //str += String.fromCharCode.apply(null, subab);
            index++;
            fullString += string;
        }

window.console.log("fullString: " + fullString.length);
        // TogetherJS.send({type: 'dataSend', name: result.value.name, content: ab2str(result.value.content), uid: result.value.uid });

        result.continue();
    };


    // slice is not implemented on IE. Implementing our own version if it is not supported.
    // if (!ArrayBuffer.prototype.slice)
    //     ArrayBuffer.prototype.slice = function (start, end) {
    //         var that = new Uint8Array(this);
    //         if (end == undefined) end = that.length;
    //         var result = new ArrayBuffer(end - start);
    //         var resultArray = new Uint8Array(result);
    //         for (var i = 0; i < resultArray.length; i++)
    //             resultArray[i] = that[i + start];
    //         return result;
    //     }

//
//
    // if (!ArrayBuffer.prototype.slice)
    //     ArrayBuffer.prototype.slice = function (start, end) {
    //         var that = new Uint8Array(this);
    //         if (end == undefined) end = that.length;
    //         var result = new ArrayBuffer(end - start);
    //         var resultArray = new Uint8Array(result);
    //         for (var i = 0; i < resultArray.length; i++)
    //             resultArray[i] = that[i + start];
    //         return result;
    //     }
        
//   var visibilityChangeFromRemote = false;

// function fireTogetherJSVisibility(element, isVisible) {
//   if (visibilityChangeFromRemote) {
//     return;
//   }
//   var elementFinder = TogetherJS.require("elementFinder");
//   var location = elementFinder.elementLocation(element);
//   TogetherJS.send({type: "visibilityChange", isVisible: isVisible, element: location});
// }

// TogetherJS.hub.on("visibilityChange", function (msg) {
//   if (! msg.sameUrl) {
//     return;
//   }
//   var elementFinder = TogetherJS.require("elementFinder");
//   // If the element can't be found this will throw an exception:
//   var element = elementFinder.findElement(msg.element);
//   visibilityChangeFromRemote = true;
//   try {
//     //MyApp.changeVisibility(element, msg.isVisible);
//   } finally {
//     visibilityChangeFromRemote = false;
//   }
