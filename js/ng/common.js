var deparam = function () {
  var querystring = location.search;
  // remove any preceding url and split
  querystring = querystring.substring(querystring.indexOf('?') + 1).split('&');
  var params = {}, pair, d = decodeURIComponent, i;
  // march and parse
  for (i = querystring.length; i > 0;) {
    pair = querystring[--i].split('=');
    params[d(pair[0])] = d(pair[1]);
  }
  return params;
};
//--  fn  deparam
var getParameterByName = function (name, string) {
  var pairs = [];
  if (string != null && string != '')
    pairs = string.split('&');
  console.log(pairs);
  for(var key in pairs){
    var pair = pairs[key];
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regexS = name + '=([^&#]*)', regex = new RegExp(regexS), results = regex.exec(pair);
    if (results != null) {
      return decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
  }
};
//Cookies。
function setCookie(c_name, value, expiredays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  document.cookie = c_name + '=' + escape(value) + (expiredays == null ? '' : ';expires=' + exdate.toGMTString());
}
function getCookie(c_name) {
  if (document.cookie.length > 0) {
    c_start = document.cookie.indexOf(c_name + '=');
    if (c_start != -1) {
      c_start = c_start + c_name.length + 1;
      c_end = document.cookie.indexOf(';', c_start);
      if (c_end == -1)
        c_end = document.cookie.length;
      return unescape(document.cookie.substring(c_start, c_end));
    }
  }
  return '';
}
String.prototype.Trim = function () {
  return this.replace(/(^\s*)|(\s*$)/g, '');
};