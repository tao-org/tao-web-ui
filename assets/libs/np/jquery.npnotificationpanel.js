/*!
 * npNotificationsPanels jQuery plugin
 *
 * it only applies to a single DOM element and options must include end-point url
 * creates job execution lists and maintain pagination and data refresh
 *
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
 */

jQuery.fn.npNotificationsPanels = function(options){
    var settings = $.extend({
        msgEmpty:"Empty dataset",
        itemsOnPage: 3,
        url: ''
    }, options );

    var $panelWrapper = $(this)[0];
    var $panelEmpty = $(".panel-list-empty", $panelWrapper);
    var $notification = $(".box-notification",$panelWrapper);

    var data = [];
    var currentPage = 0;
    var pages = 0;

    var setNewData = function(d){
        data = d;
        renderExecHistoryCurrentPage(data);
    };
    var getData = function(page){
        $.ajax({
            cache: false,
            url: settings.url + (page+1),
            dataType : 'json',
            type: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                //"X-Auth-Token": window.tokenKey
                "user": settings.headerUser
            }
        }).done(function (response) {
            setNewData(response.data);
        }).fail(function (jqXHR, textStatus) {
            console.log("fail to retrive panel data");
        });
    };

    var renderExecHistoryCurrentPage = function(jobs){
        var $panel = $(".panel-list", $panelWrapper);
        $panel.empty();
        if(jobs){
            var count = jobs.length;
            for(i = 0; i < count; i++){
                var notification = jobs[i];
                var ts = niceIsoTime(notification["timestamp"]);
                try {
                    var lclData = JSON.parse(notification["data"]);
                    var lclMsg = lclData.Payload;
                } catch(e) {
                    console.log(e); // error in the above string (in this case, yes)!
                }
                var li = document.createElement("li");
                var htmlContent = "<span class=\"text\">"+lclMsg+"</span><small class=\"label label-info\"><i class=\"fa fa-clock-o fa-fw\"></i>"+ts+"</small>";
                var $newEl = $('<li>',{
                    'html' : htmlContent
                });
                $newEl.appendTo($panel).fadeIn('slow');
            }

            //show end of records notice

            if(count > 0){
                $panelEmpty.hide();
            }else{
                if(currentPage>0){
                    $("p",$panelEmpty).html(settings.msgEnd);
                }else{
                    $("p",$panelEmpty).html(settings.msgEmpty);
                }
                $panelEmpty.show();
            }
            //syncronize pagination
            $(".val-current-page",$panelWrapper).html(currentPage+1);
            if(count>0){
                $(".next",$panelWrapper).removeClass("disabled");
            }else{
                $(".next",$panelWrapper).addClass("disabled");
            }
            if(currentPage > 0){
                $(".prev",$panelWrapper).removeClass("disabled");
            }else{
                $(".prev",$panelWrapper).addClass("disabled");
            }
        }
    };

    var ui_showExecNotification = function(){
        $notification.addClass("show");
        setTimeout(function(){
            $notification.removeClass("show");
        }, 3000);
    };
    //add pagination handlers
    $($panelWrapper)
        .on("click"," .pagination a", function(e){
            e.preventDefault();
            if($(this).parent().hasClass("disabled")){
                console.log("return");
                return;
            }
            var action = $(this).data("action");
            if(action === 'go-next'){
                currentPage++;
                ui_showExecNotification();
            }
            if(action === 'go-prev'){
                currentPage--;
                ui_showExecNotification();
            }
            if(action === 'go-refresh'){
                currentPage = 0;
                ui_showExecNotification();
            }
            getData(currentPage);
        })
        .on("panel:refresh", function(e) {
            currentPage = 0;
            ui_showExecNotification();
            getData(currentPage);
        });

    // Initializing
    currentPage = 0;
    getData(currentPage);
    return this;
};
