'use strict';

// XTK uncompiled
goog.require('X.parserDCM');
goog.require('X.parser');

var Upload = function(db){
    // variables of interest
    this.files = [];
    this.filesLoaded = [];
    this.totalSize = 0;
    this.totalProgress = 0;
    this.db = db;
};

/**
* Setup:
* 1- File Drop
* 2- File Select
* 3- Progress callbacks
* 4- IndexDB storage
*/
Upload.prototype.setup = function(){

    window.console.log('setup - setup');

    this.setupFileDrop();
    this.setupFileSelect();
};

Upload.prototype.addFile = function(fileObject){
    // update the list of files we have
    this.files.push(fileObject);
    // update the total size of data we want to upload
    this.totalSize += fileObject.size;
};

Upload.prototype.work = function(fileObject){
    //
    // add callback for status to do whatever we want
    //

    this.addFile(fileObject);
    // start reading it with a webworker!
    var myWorker = new Worker('scripts/ww_load.js');
    var _this = this;
    myWorker.onmessage = function (oEvent) {
        if(oEvent.data.status === 'progress'){
            //var percentLoaded = Math.round((oEvent.data.loaded / oEvent.data.total) * 100);
        }
        else if(oEvent.data.status === 'load'){
            // file has been loaded
            window.console.log(fileObject.name + ' loaded!!!');
            var object2 = { name: escape(fileObject.name),
                     size: fileObject.size,
                     file: fileObject,
                     content: oEvent.data.content};
            _this.filesLoaded.push(object2);
            // window.console.log(oEvent.data.content);
            // window.console.log(fileObject.size);
            // parse file header in XTK...!
            // if not parsable zip, extract it!

            // call X parser// instantiate the parser
            var _parser = new X.parserDCM();

            var data = oEvent.data.content;
            data.byteLength = fileObject.size;

            var container = new X.file();
            var object = new X.object();
            object._file = [];
            var flag = {};
            _parser.parse(container, object, data, flag);

            object2.uid = object.slices[0].sop_instance_uid;
            object2.file = null;

            object2.content = object2.content;
            _this.db.addData(object2);
        }
    };

    myWorker.postMessage(fileObject);
};

Upload.prototype.setupFileDrop = function(){

    window.console.log('setup - setupFileDrop');
    var _this = this;

    function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        evt.target.style.border = '';

        var files = evt.dataTransfer.files; // FileList object.

        // files is a FileList of File objects. List some properties.
        // var output = [];
        for (var i = 0, f; f = files[i]; i++) {
            var fileObject = {'name': escape(f.name),
                        'size': f.size,
                        'uploaded': -1,
                        'file': f};
            _this.work(fileObject);
        }
    }

    function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    function handleDragEnter(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.target.style.border = '3px solid black';
    }

    function handleDragLeave(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.target.style.border = '';
    }

    // Setup the dnd listeners.
    var dropZone = document.getElementById('drop_zone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
    dropZone.addEventListener('dragenter', handleDragEnter, false);
    dropZone.addEventListener('dragleave', handleDragLeave, false);

};

Upload.prototype.setupFileSelect = function(){

    window.console.log('setup - setupFileSelect');
    var _this = this;

    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }

    function handleFileSelect(evt) {
        var files = evt.target.files; // FileList object

        // files is a FileList of File objects. List some properties.
        // var output = [];
        for (var i = 0, f; f = files[i]; i++) {
            var fileObject = {'name': escape(f.name),
                        'size': f.size,
                        'uploaded': -1,
                        'file': f};
            _this.work(fileObject);
        }
    }

    document.getElementById('files').addEventListener('change', handleFileSelect, false);
};


// http://www.smartjava.org/content/html5-easily-parallelize-jobs-using-web-workers-and-threadpool
// function Pool(size) {
//     var _this = this;
 
//     // set some defaults
//     this.taskQueue = [];
//     this.workerQueue = [];
//     this.poolSize = size;
 
//     this.addWorkerTask = function(workerTask) {
//         if (_this.workerQueue.length > 0) {
//             // get the worker from the front of the queue
//             var workerThread = _this.workerQueue.shift();
//             workerThread.run(workerTask);
//         } else {
//             // no free workers,
//             _this.taskQueue.push(workerTask);
//         }
//     }
 
//     this.init = function() {
//         // create 'size' number of worker threads
//         for (var i = 0 ; i < size ; i++) {
//             _this.workerQueue.push(new WorkerThread(_this));
//         }
//     }
 
//     this.freeWorkerThread = function(workerThread) {
//         if (_this.taskQueue.length > 0) {
//             // don't put back in queue, but execute next task
//             var workerTask = _this.taskQueue.shift();
//             workerThread.run(workerTask);
//         } else {
//             _this.taskQueue.push(workerThread);
//         }
//     }
// }
 
// // runner work tasks in the pool
// function WorkerThread(parentPool) {
 
//     var _this = this;
 
//     this.parentPool = parentPool;
//     this.workerTask = {};
 
//     this.run = function(workerTask) {
//         this.workerTask = workerTask;
//         // create a new web worker
//         if (this.workerTask.script!= null) {
//             var worker = new Worker(workerTask.script);
//             worker.addEventListener('message', dummyCallback, false);
//             worker.postMessage(workerTask.startMessage);
//         }
//     }
 
//     // for now assume we only get a single callback from a worker
//     // which also indicates the end of this worker.
//     function dummyCallback(event) {
//         // pass to original callback
//         _this.workerTask.callback(event);
 
//         // we should use a seperate thread to add the worker
//         _this.parentPool.freeWorkerThread(_this);
//     }
 
// }
 
// // task to run
// function WorkerTask(script, callback, msg) {
 
//     this.script = script;
//     this.callback = callback;
//     this.startMessage = msg;
// };