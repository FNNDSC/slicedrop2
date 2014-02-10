console.log('\'Allo \'main!');

init = (function() {

  sd2 = new slicedrop2();
  sd2.init();
})();

window.addEventListener("DOMContentLoaded", init, false);