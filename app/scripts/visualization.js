// XTK uncompiled
goog.require('X.parserDCM');
goog.require('X.parser');
// XTK uncompiled
goog.require('X.renderer3D');

visualization = function(db){
  this.db = db;
  this.r3d = null;
  this.volume = null;
};

visualization.prototype.setup = function(){
  var _this = this;
  // add callbacks when data added to DB
  // update results
  // load data (open db)

  // add data (more ddrop)
  document.addEventListener('dbAdded', function (e) {

    window.console.log("data added!"); 
    // clean up current list
    _this.cleanUI();
    // Re-render all the todo's
    _this.db.getAllDataItems(function(e){ _this.onsuccessGetAllDataItems(e); });

    }, false);

  // add data (more ddrop)
  document.addEventListener('dbLoaded', function (e) {
    window.console.log("data loaded!"); 
    // clean up current list
    _this.cleanUI();
    // Re-render all the todo's
    _this.db.getAllDataItems(function(e){ _this.onsuccessGetAllDataItems(e); }
      );

    }, false);

    // add data (more ddrop)
  document.addEventListener('dbRemoved', function (e) {
    window.console.log("data removed!");
    // clean up current list
    _this.cleanUI();
    // Re-render all the todo's
    _this.db.getAllDataItems(function(e){ _this.onsuccessGetAllDataItems(e); }
      );

    }, false);

};

// CLEAN UI
visualization.prototype.cleanUI = function(){
  window.console.log("cleaning UI");
  var datas = document.getElementById("dataItems");
  datas.innerHTML = "";
}

// RENDER DATA
visualization.prototype.renderData = function(row) {
  var _this = this;
  var datas = document.getElementById("dataItems");
  var li = document.createElement("li");
  var x = document.createElement("a");
  var a = document.createElement("a");
  var t = document.createTextNode( row.name + " ");

  x.addEventListener("click", function(e) {

    // destroy or remove?
    // might leak a lot... to be tested
    //_this.openScene(row.text);
    window.console.log("start preview");
    window.console.log(row);
    if(_this.r3d != null){
      _this.r3d.destroy();
      delete _this.r3d;
      _this.r3d = null;
    }
  if (_this.volume != null) {
    delete _this.volume;
    _this.volume = null;
  }

      //or rendere
      window.console.log("new 3d renderer");
      _this.r3d = new X.renderer3D();
      _this.r3d.container = '3d';
      _this.r3d.init();
    

    // clean previous scene
    // we have a volume
    _this.volume = new X.volume();
    _this.volume.file = row.name + '.dcm';
    _this.volume.filedata = row.content;

    _this.r3d.add(_this.volume);

    _this.r3d.render();
  });

  x.href = "#";
  x.textContent = "[Preview]";

  a.addEventListener("click", function(e) {
    _this.db.deleteData(row.uid);
  });

  a.href = "#";
  a.textContent = "[Delete]";
  li.appendChild(t);
  li.appendChild(x);
  li.appendChild(a);
  datas.appendChild(li);
}

visualization.prototype.onsuccessGetAllDataItems = function(e) {
  var result = e.target.result;
  if(!!result == false)
    return;

  this.renderData(result.value);
  result.continue();
}