var baseURL = '/_tao/';
var baseRestURL = './_rest/'; //mock html files
var baseRestURLPHP = 'http://192.168.61.101/_rest/';

//localhost API
var baseRestApiURL = 'http://localhost:8080/';
//live API
//var baseRestApiURL = 'http://master.tao.c-s.ro:8080/';

var prefferences = {
    "viewMode": "grid",
    "autorefresh": "on"
};
var notificationsMaxNumber = 50;
var notificationsCheckInterval = 10000; //milliseconds
var authHeader = "Basic " + btoa("admin:admin");
var tokenKey = _settings.readCookie("tokenKey");

//msg dictionary
var SHARED_EDIT_RESTRICTED = "Users can not edit shared components. User have edit permission restricted to own workspace.";


//xhr.setRequestHeader ("Authorization", "Basic " + btoa(username + ":" + password));
/*
headers: {
"Accept": "application/json",
"Content-Type": "application/json",
"X-Auth-Token": window.tokenKey
"Authorization": "Basic " + btoa("admin:admin")
}
*/

