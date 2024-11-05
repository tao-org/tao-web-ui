(function () {
	// Localhost API
//	window.baseRestApiURL = 'http://pcd3368.c-s.ro/';
//	window.baseWssUrl     = 'ws://pcd3368.c-s.ro/';
	
	// Live API
	window.baseRestApiURL = 'http://pcd3368.c-s.ro/';
	window.baseWssUrl     = 'ws://pcd3368.c-s.ro/';
	
	// Custom API
//	window.baseRestApiURL = 'http://pcd3368.c-s.ro/';
//	window.baseWssUrl     = 'ws://pcd3368.c-s.ro/';
	
	// User preferences
	window.preferences                = { "viewMode": "grid", "autorefresh": "on" };
	window.notificationsMaxNumber     = 50;
	window.notificationsCheckInterval = 20000; //milliseconds
	window.monitorCheckInterval       = 10000; //milliseconds
	window.openStackPresent           =false;
	
	// User token
	window.tokenKey = _settings.readCookie("tokenKey");
	
	// General functionality variables
	window.responseStatus = { success: "SUCCEEDED", warning: "WARNING", fail: "FAILED", error: "ERROR" };
	
	// Msg dictionary
	window.SHARED_EDIT_RESTRICTED = "Users can not edit shared components. User have edit permission restricted to own workspace.";
	
	// Customisations
	window.loginBackground = [
		"./media/backgrounds/dunia.png",
		"./media/backgrounds/africa_background_1.jpg",
		"./media/backgrounds/africa_background_2.jpg",
		"./media/backgrounds/africa_background_3.jpg"
	];
	window.favicon   = "./media/icons/tao-favicon.ico";
	window.logoText  = "Agriculture Virtual Lab";
	window.logoSmall = "./media/images/avl_logo_small_transparent.png";
})();
