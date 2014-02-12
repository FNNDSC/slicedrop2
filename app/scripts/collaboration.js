'use strict';

var Collaboration = function(db){
    this.db = db;
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

                    var object2 = {name: msg.name,
                        size: '000',
                        file: null,
                        content: str2ab(msg.content),
                        uid: msg.uid };
                    _this.db.addData(object2);
                });

    };

Collaboration.prototype.onsuccessSendAllDataItems = function(e) {
        var result = e.target.result;
        if(!!result == false){
            return;
        }

        TogetherJS.send({type: 'dataSend', name: result.value.name, content: ab2str(result.value.content), uid: result.value.uid});

        result.continue();
    };

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
// });