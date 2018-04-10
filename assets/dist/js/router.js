/*!
 * Core functions for general page functionality.
 */
//default page
var DEFAULT_PAGE_URL = "#admin/dashboard";
var taoDynPageDiv = $(".tao-async-cw");
var routeTags = [];
var hashRoutesMap = [];
    hashRoutesMap["admin/dashboard"] = "./fragments/dashboard-admin.fragment.html";
    hashRoutesMap["projects"] = '';
    hashRoutesMap["workflow/all"] = "./fragments/workflow-all.fragment.html";
    hashRoutesMap["admin/users"] = "./fragments/users-admin.fragment.html";
    hashRoutesMap["admin/datasources"] = "./fragments/datasource-admin.fragment.html";
    hashRoutesMap["admin/topology"] = "./fragments/topology-admin.fragment.html";
    hashRoutesMap["admin/modules"] = "./fragments/component-admin.fragment.html";
    hashRoutesMap["documentation/intro"] = "./fragments/tao-documentation.fragment.html";
    hashRoutesMap["faq/intro"] = "./fragments/tao-faq.fragment.html";

function routeLoading(action){
    if(action === "show"){
        $("#myModalLoading").modal('show');
    }
    if(action === "hide"){
        setTimeout(function(){
            $("#myModalLoading").modal('hide');
        },500);
    }
}

//ROUTER
$(function () {
    // Event handlers for frontend navigation
    // An event handler witch calls the router function on every hashchange.
    $(window).on('hashchange', function(){
        //check authtoken
        var tokenKey = _settings.readCookie("tokenKey");
        //var tokenKey = _settings.readCookie("xauthtoken");
        if ((tokenKey=="") || (tokenKey == null)){
            $("body").empty();
            window.location = 'login.html';
        }else{
            window.tokenKey = tokenKey;
        }
        navRouter(decodeURI(window.location.hash));
        var current = moment().toISOString();
        $("#page-timestamp").html(current);
    });

    // Navigation/router function will call appropriate functions.
    function navRouter(hash) {
        var fragmentUrl = "",
            unsolvedRoute = true;
        if (!hash || (typeof hash === "string" && hash === "") || (typeof hash === "string" && hash === "#")){
            hash = DEFAULT_PAGE_URL;
        }else{
            if( hash.charAt(0)==="#") hash = hash.substring(1);
            routeTags = hash.split('/');
        }

        //fast map resolver
        if(hashRoutesMap[hash] === undefined){
        }else{
            routeLoading('show');
            fragmentUrl = hashRoutesMap[hash];
            unsolvedRoute = false;
            $.ajax({ cache: false,
                url: fragmentUrl
            })
                .done(function (data) {
                    taoDynPageDiv.html(data);
                    routeLoading('hide');
                })
                .fail(function (jqXHR, textStatus) {
                    routeLoading('hide');
                    alert("Could not load page content... Try later.")
                });
        }
        // Sync active menu. Remove active from navigation, and generically mark branch as active.
        $('.sidebar-menu .routed').removeClass('active');
        $('.sidebar-menu .routed-'+routeTags[0]+'-'+routeTags[1]).addClass("active");
        console.log('.sidebar-menu .routed-'+routeTags[0]+'-'+routeTags[1]);

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

//onMessage to enable iframe/parent comunnication
if (window.addEventListener) {
    window.addEventListener("message", onMessage, false);
}
else if (window.attachEvent) {
    window.attachEvent("onmessage", onMessage, false);
}

function onMessage(event) {
    // Check sender origin to be trusted
    if (event.origin !== "http://example.com") return;

    var data = event.data;

    if (typeof(window[data.func]) == "function") {
        window[data.func].call(null, data.message);
    }
}
// Function to be called from iframe
function parentFunc(message) {
    alert(message);
}