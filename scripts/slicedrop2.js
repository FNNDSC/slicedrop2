'use strict';

var Slicedrop2 = function(){

};

Slicedrop2.prototype.init = function(){
    console.log('-- DOM content loaded --');
    // setup the DB
    console.log('-- Setup DB--');
    var db = new Db();
    db.open();

    // setup the file drop and file select callbacks
    // setup the progress callbacks as well
    // setup the indexed DB
    console.log('-- Setup Uploader--');
    var upload = new Upload(db);
    upload.setup();

    // setup the viewer
    // create a list from what is present in DB
    // delete file functionnality
    // view file functionnality
    console.log('-- Setup GIU/Viewer--');
    // pass db to be read
    // file added callback
    // create/delete renderers on demand
    var visualization = new Visualization(db);
    visualization.setup();

    console.log('-- Setup Collaboration--');
    var collaboration = new Collaboration(db);
    collaboration.setup();
}
