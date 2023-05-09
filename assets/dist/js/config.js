(function () {
	// Localhost API
//	window.baseRestApiURL = 'http://localhost:8080/';
//	window.baseRestApiURL = 'https://localhost:8443/';
	
	// Live API
	window.baseRestApiURL = '/';
	
	// Custom API
//	window.baseRestApiURL = 'http://yourhost:8080/';
//	window.baseRestApiURL = 'https://yourhost:8443/';
	
	// User preferences
	window.prefferences               = { "viewMode": "grid", "autorefresh": "on" };
	window.notificationsMaxNumber     = 50;
	window.notificationsCheckInterval = 20000; //milliseconds
	window.monitorCheckInterval       = 10000; //milliseconds
	
	// User token
	window.tokenKey = _settings.readCookie("tokenKey");
	
	// General functionality variables
	window.responseStatus = { success: "SUCCEEDED", warning: "WARNING", fail: "FAILED", error: "ERROR" };
	
	// Msg dictionary
	window.SHARED_EDIT_RESTRICTED = "Users can not edit shared components. User have edit permission restricted to own workspace.";
})();
