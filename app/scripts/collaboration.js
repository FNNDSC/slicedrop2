'use strict';

var Collaboration = function(db){
    this.db = db;
    this.tmp = {};
    this.tmp2 = {};
    this.status = {};
    this.pool = new Pool(1);
    this.pool.init();
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
            // window.console.log("index: " + index + "  size: " + string.length);
            // add command to queue
            // TogetherJS.send();
            // "server-echo": true, 
            var worker = new WorkerTask({type: 'dataSend', name: result.value.name, content: string, uid: result.value.uid, total: total, index: index }, result.value.name);
            this.pool.addWorkerTask(worker);
            // this.taskQueue.push({type: 'dataSend', name: result.value.name, content: string, uid: result.value.uid, total: total, index: index });
            // window.console.log(this.taskQueue);
            //str += String.fromCharCode.apply(null, subab);
            index++;
            fullString += string;

            
        }

// window.console.log("fullString: " + fullString.length);
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
// });

// http://www.smartjava.org/content/html5-easily-parallelize-jobs-using-web-workers-and-threadpool
function Pool(size) {
    var _this = this;

    // set some defaults
    this.taskQueue = [];
    this.workerQueue = [];
    this.poolSize = size;
 
    this.addWorkerTask = function(workerTask) {
        // window.console.log('Add worker');
        // window.console.log(_this.workerQueue);
        // window.console.log(_this.taskQueue);
        if (_this.workerQueue.length > 0) {
            // get the worker from the front of the queue
            var workerThread = _this.workerQueue.shift();
            workerThread.run(workerTask);
        } else {
            // no free workers,
            _this.taskQueue.push(workerTask);
        }

        // window.console.log(_this.taskQueue);
    }
 
    this.init = function() {
        // create 'size' number of worker threads
        for (var i = 0 ; i < size ; i++) {
            _this.workerQueue.push(new WorkerThread(_this));
        }
     }
 
    this.freeWorkerThread = function(workerThread) {
        // window.console.log('in free thread callback');
        // window.console.log(_this.taskQueue);
        if (_this.taskQueue.length > 0) {
            // don't put back in queue, but execute next task
            var workerTask = _this.taskQueue.shift();
            workerThread.run(workerTask);
        } else {
            _this.workerQueue.push(workerThread);
        }
    }
}
 
// runner work tasks in the pool
function WorkerThread(parentPool) {
 
    var _this = this;
 
    this.parentPool = parentPool;
    this.workerTask = {};
 
    this.run = function(workerTask) {
        _this.workerTask = workerTask;
        // send websocket
        if (_this.workerTask.script!= null) {

            // callback when finished to clean up pool
            setTimeout(function(){TogetherJS.send(_this.workerTask.script);_this.dummyCallback('yo')}, 50);
            
            // wait 1 s

            // go for dummy callback

            // var worker = new Worker(workerTask.script);
            // worker.addEventListener('message', dummyCallback, false);
            // worker.postMessage(workerTask.startMessage);
        }
    }
 
    // for now assume we only get a single callback from a worker
    // which also indicates the end of this worker.
    this.dummyCallback = function(event) {
        // window.console.log('in dummy callback');
        // pass to original callback
        // _this.workerTask.callback(event);
 
        // we should use a seperate thread to add the worker
        _this.parentPool.freeWorkerThread(_this);
    }
 
}
 
// task to run
function WorkerTask(object, msg) {
 
    this.script = object;
    // this.callback = callback;
    this.startMessage = msg;
};