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
        taoLoadingDiv.modal('show');
    }
    if(action === "hide"){
        setTimeout(function(){
            taoLoadingDiv.modal('hide');
        },1000);
    }
}

//ROUTER
$(function () {
    var taoDynPageDiv = $(".tao-async-cw");
    var DEFAULT_PAGE_URL = "#admin/dashboard";
    var UNDEFINED_PAGE_URL = "#undefined/page";
    var hashRoutesMap = [];
    hashRoutesMap["admin/dashboard"] = "./fragments/dashboard-admin.fragment.html";
    hashRoutesMap["projects"] = '';

    hashRoutesMap["admin/users"] = "./fragments/users-admin2.fragment.html";
    hashRoutesMap["admin/topology"] = "./fragments/topology-admin2.fragment.html";
    hashRoutesMap["documentation/intro"] = "./fragments/tao-documentation.fragment.html";
    hashRoutesMap["howto/intro"] = "./fragments/tao-howto.fragment.html";
    hashRoutesMap["my/workflows"] = "./fragments/workflows-admin2.fragment.html";
    hashRoutesMap["my/components"] = "./fragments/component-admin2.fragment.html";
    hashRoutesMap["my/auxfiles"] = "./fragments/my-auxfiles.fragment.html";
    //hashRoutesMap["my/scripts"] = "./fragments/my-scripts.fragment.html";
    hashRoutesMap["my/queries"] = "./fragments/datasources-queries.fragment.html";
    hashRoutesMap["my/datasetwizzard"] = "./fragments/datasources-queries.fragment.html";

    hashRoutesMap["shared/workflows"] = "./fragments/workflows-all.fragment.html";
    hashRoutesMap["shared/workflows"] = "./fragments/workflows-admin2.fragment.html";
    hashRoutesMap["shared/components"] = "./fragments/component-admin2.fragment.html";
    hashRoutesMap["shared/auxfiles"] = "./fragments/my-auxfiles.fragment.html";
    hashRoutesMap["shared/datasources"] = "./fragments/datasource-admin2.fragment.html";
    hashRoutesMap["undefined/page"] = "./fragments/tao-howto.fragment.html";

    // Event handlers for frontend navigation
    $(window).on('hashchange', function(){
        //check authtoken
        var tokenKey = _settings.readCookie("tokenKey");
        if ((tokenKey==="") || (tokenKey == null)){
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
            console.log(routeFilters);
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
        $('.sidebar-menu .routed').removeClass('active');
        $('.sidebar-menu .routed-'+routeTags[0]+'-'+routeTags[1]).addClass("active");

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
