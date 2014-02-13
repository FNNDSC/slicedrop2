'use strict';

var Db = function(){
    // In the following line, you should include the prefixes of implementations you want to test.
    // window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    // // DON'T use "var indexedDB = ..." if you're not in a function.
    // // Moreover, you may need references to some window.IDB* objects:
    // window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    // window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    // if (!window.indexedDB) {
    //     window.alert('Your browser doesn\'t support a stable version of IndexedDB. Such and such feature will not be available.');
    // }
    // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
    // variables of interest
    this.db = null;
};

// ERROR
Db.prototype.onerror = function(e){
    console.log(e.value);
};

//OPEN
Db.prototype.open = function(){
    var _this = this;
    var version = 5;
    var request = indexedDB.open('slicedrop', version);

    // We can only create Object stores in a versionchange transaction.
    request.onupgradeneeded = function(e) {
        var db = e.target.result;

        // A versionchange transaction is started automatically.
        e.target.transaction.onerror = _this.onerror;

        if(db.objectStoreNames.contains('data')) {
            db.deleteObjectStore('data');
        }

        var store = db.createObjectStore('data', {keyPath: 'uid'});
    };

    request.onsuccess = function(e) {
        _this.db = e.target.result;
        var event = new Event('dbLoaded');
        // Dispatch the event.
        document.dispatchEvent(event);
    };

    request.onerror = this.onerror;
};

// ADD DATA
Db.prototype.addData = function(dataObject) {
        var db = this.db;
        var trans = db.transaction(['data'], 'readwrite');
        var store = trans.objectStore('data');
      // dataObject
      //       var object = { name: escape(fileObject.name),
      //                      size: fileObject.size,
      //                      file: fileObject,
      //                      content: oEvent.data.content};
      //                      uid
        var data  = dataObject;
        data.timeStamp =  new Date().getTime();

        var request = store.put(data);

        request.onsuccess = function() {
            // trigger event!
            var event = new Event('dbAdded');
            // Dispatch the event.
            document.dispatchEvent(event);
        };

        request.onerror = this.onerror;
    };

// QUERY DATA
Db.prototype.getAllDataItems = function(callback) {
    var db = this.db;
    var trans = db.transaction(['data'], 'readwrite');
    var store = trans.objectStore('data');

    // Get everything in the store;
    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = store.openCursor(keyRange);

    cursorRequest.onsuccess = callback;
    cursorRequest.onerror = this.onerror;
};

// DELETE DATA
Db.prototype.deleteData = function(id) {
    var db = this.db;
    var trans = db.transaction(['data'], 'readwrite');
    var store = trans.objectStore('data');
    var request = store.delete(id);

    request.onsuccess = function() {
        // trigger event!
        var event = new Event('dbRemoved');
        // Dispatch the event.
        document.dispatchEvent(event);
    };

    request.onerror = this.onerror;
};
