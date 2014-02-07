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