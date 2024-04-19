/**
 * Copyright  CS ROMANIA, http://c-s.ro
 *
 * Licensed under the ....;
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * file details: core functions and general functionality, request router for single page app.
 *
 **/

//default page
var taoLoadingDiv = $("#myModalLoading");
var routeTags = [];
var routeFilters = {};
var userOpStack = [];  //holder for aditional user action parameters

//UI loading indicator management
function routeLoading(action){
    if(action === "show"){
		if (taoLoadingDiv.data("bs.modal") && taoLoadingDiv.data("bs.modal").$backdrop == null) {
			taoLoadingDiv.modal('show');
		}
    }
    if(action === "hide"){
        setTimeout(function(){
            taoLoadingDiv.modal('hide');
        }, 100);
    }
}

function refreshToken() {
	var refreshed = false;
	
	var tokenRefresh = _settings.readCookie("refreshToken");
	var userId = _settings.readCookie("TaoUserId");
	if (tokenRefresh !== "" && tokenRefresh != null && userId !== "" && userId != null) {
		// Refresh token
		$.ajax({
			"async"  : false,	// !!! Important: this call MUST be synchronous otherwise some ajax call will fail
			"cache"  : false,
			"url"    : baseRestApiURL + "auth/refresh",
			"method" : "POST",
			"headers": { "Content-Type": "application/x-www-form-urlencoded" },
			"data"   : { "user" : userId, "token": tokenRefresh },
			"success": function (r) {
				var apiData = chkTSRF(r);
				if (apiData.token && apiData.refreshToken) {
					console.log("Token refreshed [" + apiData.token + "]");
					// Restore token cookies
					_settings.createCookie("tokenKey", apiData.token, apiData.expiresInSeconds/60/60/24);
					_settings.createCookie("refreshToken", apiData.refreshToken);
					// Restore global token variable
					window.tokenKey = apiData.token;
					refreshed = true;
				} else {
					console.log("Failed to retrieve new token. User should try and log back in.");
                    _settings.createCookie("tokenKey",'');
                    _settings.createCookie("userMatrix",'{}');
                    _settings.createCookie("refreshToken","");
                    _settings.createCookie("userRole","");
                    _settings.createCookie("TaoUserId","");
                    _settings.createCookie("TaoUserName","");
					//window.location = "login.html";
				}
			},
			"error": function (jqXHR, status, textStatus) {
				console.log("Could not refresh the token. User should try and log back in.");
                _settings.createCookie("tokenKey",'');
                _settings.createCookie("userMatrix",'{}');
                _settings.createCookie("refreshToken","");
                _settings.createCookie("userRole","");
                _settings.createCookie("TaoUserId","");
                _settings.createCookie("TaoUserName","");
				//window.location = "login.html";

			}
		});
	} else {
		console.log("Missing refresh token information");
	}
	return refreshed;
}

// Catch ajax calls and check for token validity
(function() {
	var _oldAjax = $.ajax;
	$.ajax = function(options) {
		var tokenKey = _settings.readCookie("tokenKey");
		if ((typeof options.headers !== "undefined") && (typeof options.headers["X-Auth-Token"] !== "undefined") && (tokenKey === "" || tokenKey == null)) {
			// Refresh token
			if (refreshToken()) {
				options.headers["X-Auth-Token"] = window.tokenKey;
			}
		}
		return _oldAjax(options);
	 };
})();

//ROUTER
$(function () {
    var taoDynPageDiv = $(".tao-async-cw");
    var DEFAULT_PAGE_URL = "#admin/dashboard";
    var UNDEFINED_PAGE_URL = "#undefined/page";
    var hashRoutesMap = [];
    hashRoutesMap["admin/dashboard"] = "./fragments/dashboard-admin.fragment.html";
    hashRoutesMap["projects"] = '';
	
    // User section
    hashRoutesMap["my/queries"] = "./fragments/datasources-queries.fragment.html";
    hashRoutesMap["my/sharedDatasets"] = "./fragments/shared-datasets.fragment.html";
	hashRoutesMap["my/explorer"] = "./fragments/datasources-queries.fragment.html";
	hashRoutesMap["my/workflows"] = "./fragments/workflows-admin2.fragment.html";
//	hashRoutesMap["my/auxfiles"] = "./fragments/my-auxfiles.fragment.html";
    hashRoutesMap["my/repositories"] = "./fragments/repositories.fragment.html";
    hashRoutesMap["my/scheduling"] = "./fragments/scheduling-admin2.fragment.html";
    hashRoutesMap["my/sites"] = "./fragments/sites.fragment.html";
    
	// Remote Services components section
	hashRoutesMap["my/remoteServices"] ="./fragments/remoteServices-components.fragment.html";
	hashRoutesMap["my/components"] ="./fragments/components-user.fragment.html";
    hashRoutesMap["my/containers"] ="./fragments/containers-user.fragment.html";
    // Shared section
//	hashRoutesMap["shared/components"] = "./fragments/component-admin2.fragment.html";
//	hashRoutesMap["shared/workflows"] = "./fragments/workflows-admin2.fragment.html";
//	hashRoutesMap["shared/auxfiles"] = "./fragments/my-auxfiles.fragment.html";
	
	// Resources
	hashRoutesMap["admin/components"] = "./fragments/component-admin2.fragment.html";
	hashRoutesMap["admin/datasources"] = "./fragments/datasource-admin2.fragment.html";
    hashRoutesMap["admin/topology"] = "./fragments/topology-admin2.fragment.html";
    hashRoutesMap["admin/containers"] = "./fragments/containers-admin2.fragment.html";
    hashRoutesMap["admin/repositoriesTemplate"] = "./fragments/repositoriesTemplate-admin2.fragment.html";
    hashRoutesMap["admin/remoteServices"] = "./fragments/remoteServices-admin2.fragment.html";
    hashRoutesMap["admin/users"] = "./fragments/users-admin2.fragment.html";
    hashRoutesMap["admin/systemDashboard"] = "./fragments/systemDashboard-admin2.fragment.html";
    hashRoutesMap["admin/config"] = "./fragments/configuration.fragment.html";
	
	// Documentation
    hashRoutesMap["howto/intro"] = "./fragments/tao-howto.fragment.html";
    hashRoutesMap["documentation/intro"] = "./fragments/tao-documentation.fragment.html";
    hashRoutesMap["undefined/page"] = "./fragments/tao-howto.fragment.html";

    // Event handlers for frontend navigation
    $(window).on('hashchange', function(){
        //check authtoken
		var tokenKey = _settings.readCookie("tokenKey");
		if (tokenKey === "" || tokenKey == null) {
			if (!refreshToken()) {
				$("body").empty();
				window.location = 'login.html';
			}
        } else {
            window.tokenKey = tokenKey;

            // check ws connection status
            if(window.wsController){
                window.wsController.checkConnection();
            }
        }
        navRouter(decodeURI(window.location.hash));
    });

    // Navigation/router function will call appropriate functions.
    function navRouter(hash) {
        var fragmentUrl = "";
        var unsolvedRoute = true;
        if (!hash || (typeof hash === "string" && hash === "") || (typeof hash === "string" && hash === "#")){
            hash = DEFAULT_PAGE_URL;
        }
        if( hash.charAt(0)==="#"){
            routeFilters = {};
            hash = hash.substring(1);
            var hParts = hash.split("::");
            hash = hParts[0];
            if(hParts[1]){
                var hExtra = hParts[1];
                hExtra = hExtra.split("|");
                _.map(hExtra, function(s){ var a=s.split("="); routeFilters[a[0]] = a[1];});
            }
            //console.log(routeFilters);
        }
        if(hashRoutesMap[hash] === undefined){
            hash = UNDEFINED_PAGE_URL;
            hash = hash.substring(1);
        }
        routeTags = hash.split('/');

        //map resolver, fragment loader & renderer
        routeLoading('show');
        fragmentUrl = hashRoutesMap[hash];
        unsolvedRoute = false;

        //set viewMode before loading fragment
        var preferences_viewMode = "grid";
        var username = _settings.readCookie("TaoUserName");
        var pageName = routeTags[0] +'-'+ routeTags[1];
        var currentPref = [];
        $.when(_userPref.getUserPreferences(username))
        .done(function(responseProfile){
            var r = responseProfile.data;
            currentPref = r.preferences;
        });
        $.each(currentPref, function(index,value){
            keyValue = value.key;
            if(keyValue.includes(pageName) === true){
                preferences_viewMode = value.value;
                return false;
            }
        });
        preferences.viewMode = preferences_viewMode;
        
        $.ajax({
            cache: false,
            url: fragmentUrl
        })
        .done(function (data) {
                taoDynPageDiv.html(data);
                routeLoading('hide');
        })
        .fail(function (jqXHR, textStatus) {
                taoDynPageDiv.html('');
                routeLoading('hide');
                alert("Could not load page content... Try later.")
        });
        // Sync active menu. Remove active from navigation, and generically mark branch as active.
        $('.sidebar-menu .routed').removeClass('active opened');
        $('.sidebar-menu .routed-'+routeTags[0]+'-'+routeTags[1]).addClass("active opened");

        if(routeTags[0] === "account"){
            if(routeTags[1] === "profile"){
                //to do something custom
            }
        }
        if(unsolvedRoute){
            console.log("router could not solve route");
            renderErrorPage();
        }
        taoDynPageDiv.addClass('visible');
    }

    // Shows the home in case of error.
    function renderErrorPage(){
        window.location.hash = DEFAULT_PAGE_URL;
    }

    //trigger a hashchange to start app
    $(window).trigger('hashchange');
});
