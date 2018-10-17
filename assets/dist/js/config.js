//localhost API
var baseRestApiURL = 'http://localhost:8080/';
//live API
//var baseRestApiURL = '/';

var prefferences = {
    "viewMode": "grid",
    "autorefresh": "on"
};
var notificationsMaxNumber = 50;
var notificationsCheckInterval = 10000; //milliseconds
var authHeader = "Basic " + btoa("admin:admin");
var tokenKey = _settings.readCookie("tokenKey");

var responseStatus = {
	success: "SUCCEEDED",
	fail   : "FAILED",
	error  : "ERROR",
	warning: "WARNING"
};

//msg dictionary
var SHARED_EDIT_RESTRICTED = "Users can not edit shared components. User have edit permission restricted to own workspace.";


