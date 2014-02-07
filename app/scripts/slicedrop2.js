slicedrop2 = function(){

};

slicedrop2.prototype.init = function(){
  console.log("-- DOM content loaded --");
  // setup the DB
  console.log("-- Setup DB--");
  db = new db();
  db.open();

  // setup the file drop and file select callbacks
  // setup the progress callbacks as well
  // setup the indexed DB
  console.log("-- Setup Uploader--");
  upload = new upload(db);
  upload.setup();

  // setup the viewer
  // create a list from what is present in DB
  // delete file functionnality
  // view file functionnality
  console.log("-- Setup GIU/Viewer--");
  // pass db to be read
  // file added callback
  // create/delete renderers on demand
  visualization = new visualization(db);
  visualization.setup();

  console.log("-- Setup Collaboration--");
  collaboration = new collaboration(db);
  collaboration.setup();
}