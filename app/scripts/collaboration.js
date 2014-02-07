collaboration = function(db){
  this.db = db;
};

collaboration.prototype.setup = function(){

  var _this = this;

  TogetherJS.hub.on("togetherjs.hello", function (msg) {
                  if (! msg.sameUrl) {
                    return;
                  }

                  _this.db.getAllDataItems(function(e){ _this.onsuccessSendAllDataItems(e); });
                  
                });

TogetherJS.hub.on("dataSend", function (msg) {
  if (! msg.sameUrl) {
    return;
  }


  //window.console.log('received: ' + msg.name);
        //window.console.log(fileObject.name + " loaded!!!");
      var object2 = {name: msg.name,
                     size: 000,
                     file: null,
                     content: str2ab(msg.content),
                     uid: msg.uid };
     _this.db.addData(object2);
});

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

}

collaboration.prototype.onsuccessSendAllDataItems = function(e) {
  var result = e.target.result;
  if(!!result == false)
    return;


function ab2str(buf) {
   var str = "";
   var ab = new Uint16Array(buf);
   var abLen = ab.length;
   var CHUNK_SIZE = Math.pow(2, 16);
   var offset, len, subab;
   for (offset = 0; offset < abLen; offset += CHUNK_SIZE) {
      len = Math.min(CHUNK_SIZE, abLen-offset);
      subab = ab.subarray(offset, offset+len);
      str += String.fromCharCode.apply(null, subab);
   }
   return str;
}
    function str2ab(str) {
       var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
       var bufView = new Uint16Array(buf);
       for (var i=0, strLen=str.length; i<strLen; i++) {
         bufView[i] = str.charCodeAt(i);
       }
       return buf;
     }


                  TogetherJS.send({type: "dataSend", name: result.value.name, content: ab2str(result.value.content), uid: result.value.uid});

  result.continue();
}