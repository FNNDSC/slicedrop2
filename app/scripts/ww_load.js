// 'use strict';

// import reader instead....
var reader;

function abortRead() {
    reader.abort();
}

function errorHandler(evt) {
    switch(evt.target.error.code) {
        case evt.target.error.NOT_FOUND_ERR:
            console.log('File Not Found!');
            break;
        case evt.target.error.NOT_READABLE_ERR:
            console.log('File is not readable');
            break;
        case evt.target.error.ABORT_ERR:
            break; // noop
        default:
            console.log('An error occurred reading this file.');
    }
}

function updateProgress(evt) {
    // evt is an ProgressEvent.
    if (evt.lengthComputable) {
        postMessage({'status': 'progress', 'loaded': evt.loaded, 'total': evt.total});
    }
}

function updateLoad(evt) {
    var contents = evt.target.result;
    postMessage({'status': 'load', 'content': contents});
}


reader = new FileReader();
reader.onerror = errorHandler;
reader.onprogress = updateProgress;
reader.onabort = function(e) {
    alert('File read cancelled');
};
reader.onloadstart = function(e) {
    // document.getElementById('progress_bar').className = 'loading';
};
 
reader.onload = updateLoad;

onmessage = function (oEvent) {
    if(oEvent.data.uploaded === -1){
        // Read in the image file as a binary string.
        // reader.readAsBinaryString(oEvent.data.file);
        reader.readAsArrayBuffer(oEvent.data.file);
	}
};