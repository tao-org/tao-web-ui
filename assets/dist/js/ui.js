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
 * functions:
 * taoUI_UpdateUserQuota()  //update user quota indications in UI
 * showMsg()                //show UI message in toast like notification
 *
 *
 **/


//user idetity
var taoUserProfile = {};
//create user profile variable
$(function () {
    var cookieProfile = _settings.readCookie("userMatrix");
    taoUserProfile = JSON.parse(cookieProfile);
    $(".val-user-fullname").html(taoUserProfile.userFullName);
    $(".val-user-role").html(taoUserProfile.userRole);
    $(".val-user-email").html(taoUserProfile.userEmail);
    var gravatarUrl = "https://www.gravatar.com/avatar/"+taoUserProfile.userEmailMD5+"?d=mp&s=160";
    $(".val-user-avatar").attr("src", gravatarUrl);
});



(function(){
    var $elModalProfile = $("#myModalWorkFlow");
    function f(){
        $.ajax({ cache: false,
            url: "./fragments/profile.fragment.html"
        })
            .done(function (data) {
                $(".modal-dialog",$elModalProfile).html(data);
                var gravatarUrl = "https://www.gravatar.com/avatar/"+taoUserProfile.userEmailMD5+"?d=mp&s=160";
                $(".card-profile img",$elModalProfile).attr("src", gravatarUrl);
                $(".val-user-fullname",$elModalProfile).html(taoUserProfile.userFullName);
                $(".val-user-role",$elModalProfile).html(taoUserProfile.userRole);
                $(".val-user-email",$elModalProfile).html(taoUserProfile.userEmail);
                $(".val-user-email2",$elModalProfile).html(taoUserProfile.userEmail2);
                $(".val-user-org",$elModalProfile).html(taoUserProfile.userOrg);
                $(".val-user-name",$elModalProfile).html(taoUserProfile.userName);
                $(".val-user-phone",$elModalProfile).html(taoUserProfile.userPhone);
                $(".val-user-quota",$elModalProfile).html(taoUserProfile.userQota);
                $elModalProfile.modal("show");
            })
            .fail(function (jqXHR, textStatus) {
                alert("Could not load user profile... Try later.");
            });
    }
    $(".do-editprofile").on("click", function(e){
        e.preventDefault();
        f();
    });

    $(".do-logout").on("click", function(e){
        e.preventDefault();
        taoUserProfile = {};
        _settings.createCookie("tokenKey",'');
        _settings.createCookie("userMatrix",'{}');
        location.reload(true);
        //alert("logout");
    });


}());


(function () {
    function f(v){
//      $.extend(q, v);
        return 1;
    }
    window.taoUI_UpdateUserProfile = f;
}());


(function () {
    var $elQuota = $("#wrapper-quota");
    var q = {
        "total":100,
        "used":0,
        "um":"GB"
    };
    function f(v){
        $.extend(q, v);
        var pct = Math.ceil(q.used/q.total*100);
        $elQuota.find(".val-quota").html(q.total+q.um);
        $elQuota.find(".val-quota-pct").html(pct+"%");
        if(pct>100){pct = 100;}
        $elQuota.find(".val-quota-pct-ui").width(pct+"%");
        $elQuota.show();
        return true;
    }
    window.taoUI_UpdateUserQuota = f;
}());

(function () {
    var version = '0.2',
        $elMsgBox = $("#messagesBox"),
        my_messages_index = 0;
    function f(msg, status, closable){
        if (msg === ""){
            return false;
        }
        my_messages_index++;
        var collor_class = "";
        if(status === 'SUCCESS'){
            collor_class = " msg-green";
        }
        if(status === 'INFO'){
            collor_class = " msg-yellow";
        }
        if(status === 'WARN'){
            collor_class = " msg-yellow";
        }
        if(status === 'FAIL'){
            collor_class = " msg-red";
        }
        if(status === 'ERROR'){
            collor_class = " msg-red";
        }
        $elMsgBox.prepend('<div id="messagesBoxItem'+my_messages_index+'" class="messagesBoxItem'+collor_class+'">'+msg+'</div>');
        $('#messagesBoxItem'+my_messages_index).delay(4000).fadeOut(function(){$(this).remove();});
        return true;
    }
    window.showMsg=f;
    return true;
}());

(function () {
    var version = '0.1',
        $elChatBox = $("#bot-notice-chat .box"),
        $elClonable = $(".direct-chat-msg.master", "#bot-notice-chat"),
        $elMsgCount = $(".val-msgcount", "#bot-notice-chat");
    function retriveNotifications(){
        $.ajax({ cache: false,
            url: baseRestApiURL + "monitor/notification/?rnd=" + Math.random(),
            dataType : 'json',
            type: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": authHeader
            }
        })
            .done(function (getMonitorNotificationResponse, statusText, xhr) {
                //console.log(getMonitorNotificationResponse);
                for(k=0;k<getMonitorNotificationResponse.length; k++){
                    if(!$elChatBox.is(':visible')){
                        $elChatBox.slideDown();
                    }
                    var $el = $elClonable.clone();
                    $el.removeClass("master").removeClass("hidden");
                    $el.find(".val-msg-ts").html(moment.unix(getMonitorNotificationResponse[k]['timestamp']/1000).format("DD MMM YYYY hh:mm:ss a"));
                    try {
                        var obj = JSON.parse(getMonitorNotificationResponse[k]['data']);
                        //$el.find(".val-msg-txt").html(getMonitorNotificationResponse[k]['data']);
                        $el.find(".val-msg-txt").html(obj.Payload);
                    }
                    catch(err) {
                        $el.find(".val-msg-txt").html("unparsable message");
                    }
                    $($el).prependTo(".direct-chat-messages", "#bot-notice-chat");
                    var count = $(".direct-chat-messages > .direct-chat-msg").length;
                    if(count>notificationsMaxNumber){
                        $('.direct-chat-messages > .direct-chat-msg:last').remove();
                        $(".val-msgcount", "#bot-notice-chat").html(notificationsMaxNumber+"+");
                        $(".max-msg-note").removeClass("hidden");
                    } else{
                        $elMsgCount.html(count);
                    }
                }
            })
            .fail(function (jqXHR, textStatus) {
            })
            .complete(function(){
                //if($("#widget-master-monitor").length){
                setTimeout(function(){
                    retriveNotifications();
                },notificationsCheckInterval);
                //}
            });
    }
    $(".val-notificationsmaxnumber", "#bot-notice-chat").html(notificationsMaxNumber);
    //setup events
    $("#bot-notice-chat")
        .on("click", ".tools", function(){
            $(this)
                .closest(".direct-chat-msg")
                .slideUp("normal",function(){
                    $(this).remove();
                    var count = $(".direct-chat-messages > .direct-chat-msg").length;
                    $(".val-msgcount", "#bot-notice-chat").html(count);
                    if(count<1){$("#bot-notice-chat .box").slideUp();}
                });
        })
        .on("click", ".do-clear-all-notice", function(){
            $("#bot-notice-chat .direct-chat-messages .tools").trigger("click");
            $(".max-msg-note").addClass("hidden");
        });
    retriveNotifications();
    return true;
}());

