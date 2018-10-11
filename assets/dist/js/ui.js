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


//user idetity scripts
//create user profile variable
var taoUserProfile = {};

var taoEnums = {
    data: {},
    getEntity: function(e){
        if (this.data[e]) {
            return this.data[e];
        }
        return undefined;
    },
    getValueForKey: function(e,k){
        if (this.data[e]) {
            r = _.where(this.data[e], {key: k});
            if(r[0] && r[0]["value"]){
                return r[0]["value"];
            }else return undefined;
        }
        return undefined;
    }
};
var enums = {
    data: {},
    populate: function(v) {
        this.data = v;
    },
    getEntity: function(e){
        if (data[e]) {
            return this.data[e];
        }
        return undefined;
    }
};



$(function () {
    var username = _settings.readCookie("TaoUserName");
    var ajax_getProfileSettings = $.ajax({
        cache: false,
        url: baseRestApiURL + "user/"+username,
        dataType : 'json',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.tokenKey
        }
    });
    var ajax_getConfigEnums = $.ajax({
        cache: false,
        url: baseRestApiURL + "config/enums",
        dataType : 'json',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.tokenKey
        }
    });

    $.when(ajax_getProfileSettings, ajax_getConfigEnums)
        .done(function (response, enumsResponse) {
            var r = chkTSRF(response[0]);
            var enums = chkTSRF(enumsResponse[0]);
            taoEnums.data = enums;
            console.log("enums:"); console.log(enums);

            //inject additional elements into user profile data.
            if(r.id){
                taoUserProfile = r;
                taoUserProfile.userEmailMD5 = CryptoJS.MD5(r.email).toString();
                if(r.groups && r.groups[0]){
                    taoUserProfile.userRole = r.groups[0]["name"];
                }else{
                    alert("Your account membership has been revoked.\nYou are not a member of any user groups therefore you are denied access and you will be redirected to the login page.\nContact your TAO administrator to fix the account permissions.");
                    window.location = 'login.html';
                }
            }
            $(".val-user-fullname").html(taoUserProfile.lastName+" "+taoUserProfile.firstName);
            $(".val-user-role").html(taoUserProfile.userRole);
            $(".val-user-email").html(taoUserProfile.email);
            var gravatarUrl = "https://www.gravatar.com/avatar/"+taoUserProfile.userEmailMD5+"?d=mp&s=160";
            $(".val-user-avatar").attr("src", gravatarUrl);
            $(document).trigger( "quota:update" );
            $(".wrapper").fadeTo( "slow", 1, function() {});
        })
        .fail(function (jqXHR, status, textStatus) {
            window.location = 'login.html';
        });
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
                $(".val-user-fullname",$elModalProfile).html(taoUserProfile.lastName+" "+taoUserProfile.firstName);

                $(".val-user-fname",$elModalProfile).html(taoUserProfile.firstName);
                $(".val-user-lname",$elModalProfile).html(taoUserProfile.lastName);

                $(".val-user-role",$elModalProfile).html(taoUserProfile.userRole);
                $(".val-user-email",$elModalProfile).html(taoUserProfile.email);
                $(".val-user-email2",$elModalProfile).html(taoUserProfile.alternativeEmail);
                $(".val-user-org",$elModalProfile).html(taoUserProfile.organization);
                $(".val-user-name",$elModalProfile).html(taoUserProfile.username);
                $(".val-user-phone",$elModalProfile).html(taoUserProfile.phone);
                $(".val-user-quota",$elModalProfile).html(taoUserProfile.quota);
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
        var postLogout = $.ajax({
            cache: false,
            url: baseRestApiURL + "auth/logout",
            type: 'POST',
            data: '',
            headers: {
                "X-Auth-Token": window.tokenKey
            }
        });
        $.when(postLogout)
            .done(function (postLogoutResponse) {
				location.reload(true);
            })
            .fail(function(jqXHR, textStatus){
                console.log(jqXHR);
                console.log(textStatus);
                alert("Could not logout. It seems you are already logged out.");
            });
        taoUserProfile = {};
        _settings.createCookie("tokenKey",'');
        _settings.createCookie("userMatrix",'{}');
    });
}());

(function(){
    var getUserFiles = $.ajax({ cache: false,
        url: baseRestApiURL + "files/user/",
        dataType : 'json',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.tokenKey
        }
    });
    function f(){
        $.when(getUserFiles)
            .done(function (getUserFilesResponse) {
                var sumFiles = 0;
                var countFolders = 0;
                var countFiles = 0;
                $.each( getUserFilesResponse.data, function( key, value ) {
                    if(value.relativePath !== ""){
                        if(value.folder){
                            countFolders ++;
                        }else{
                            countFiles ++;
                            sumFiles += value.size;
                        }
                    }
                });
                taoUI_UpdateUserQuota({
                    "total":parseFloat(taoUserProfile.quota),
                    "used":getFileSizeAsGB(sumFiles),
                    "um":"GB",
                    "files":countFiles,
                    "folders":countFolders
                });
            })
            .fail(function (jqXHR, textStatus) {
                console.log("Error. Could not determine user storage usage... Try later.");
            });
    }
    $(document).on( "quota:update", function( event ) {
        f();
    });
}());



(function () {
    var $elQuota = $("#wrapper-quota");
    var q = {
        "total":100,
        "used":0,
        "um":"GB",
        "files":0,
        "folders":0
    };
    function f(v){
        $.extend(q, v);
        var pct = Math.ceil(q.used/q.total*100);
        $elQuota.find(".val-quota").html(q.total+q.um);
        $elQuota.find(".val-quota-pct").html(pct+"%");
        if(pct>100){pct = 100;}
        $elQuota.find(".val-quota-pct-ui").width(pct+"%");
        $elQuota.find(".val-quota-usage-details").html("using: "+q.used+"GB<br>"+q.files+" Files, "+q.folders+" Folders");
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
            //url: baseRestApiURL + "monitor/notification/",
            url: baseRestApiURL + "monitor/notification/?rnd=" + Math.random(),
            dataType : 'json',
            type: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        })
        .done(function (r, statusText, xhr) {
            var getMonitorNotificationResponse = chkTSRF(r);
            //console.log(getMonitorNotificationResponse);
            for(k=0;k<getMonitorNotificationResponse.length; k++){
                    if(!$elChatBox.is(':visible')){
                        $elChatBox.slideDown();
                    }
                    var $el = $elClonable.clone();
                    $el.removeClass("master").removeClass("hidden");
                    $el.find(".val-msg-ts").html(niceIsoTime(getMonitorNotificationResponse[k]['timestamp']));
                    try {
                        var obj = JSON.parse(getMonitorNotificationResponse[k]['data']);
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


//customize paremeterws for workflow
(function () {

    var wf_loadModuleProcessing = function(nid,lcl_n,componentTemplate){
        var html_details = "";

        html_details +="<span>version: "+componentTemplate.version+"</span><br>";
        html_details +="<span>description: "+componentTemplate.description+"</span><br>";
        html_details +="<span>authors: "+componentTemplate.authors+"</span><br>";
        html_details +="<span>copyright: "+componentTemplate.copyright+"</span><br>";
        $(".val-propbar-details", widgetRootEl).html(html_details);

        //load system vars
        $tblEdt = $("#tbl-edt-sysvar");
        $tblEdt.find(".val-row").remove();

        var helper_putValue = function($el, name, type, value, valueset){

            var currentCustomValueSet = (_.find($propbar.nodeData.customValues, function(item) {
                return (item.parameterName === name);
            }));
            //console.log("value:"+value+"current"+currentCustomValueSet.parameterValue);
            if(currentCustomValueSet && currentCustomValueSet.hasOwnProperty('parameterValue')){
                value = currentCustomValueSet.parameterValue;
            }

            if((valueset.length === 1) && (( valueset[0] === "") || ( valueset[0] === "null"))){
                $('input.var-value', $el).val(value);
                if(humanJavaDataType(type) === "Date"){
                    $('input.var-value-string', $el).attr("type", "date");
                }
                if((humanJavaDataType(type) === "Double") || (humanJavaDataType(type) === "Short") || (humanJavaDataType(type) === "Float") || (humanJavaDataType(type) === "Number")){
                    $('input.var-value-string', $el).attr("type", "number");
                }
                $('input.var-value-string', $el).val(value).show();
            }else{
                $('input.var-value', $el).val(value);
                var html = "";
                $.each(valueset, function(i, v) {
                    html +="<option "+(v === value && 'selected ')+"value=\""+v+"\">"+v+"</option>";
                });
                $('select.var-value-list', $el).html(html).show();
            }
        };
        var helper_addSTblEdtRow = function($tblEdt, payload){
            var obj = {
                "dataType": "java.lang.String",
                "defaultValue": "",
                "description": "",
                "format": null,
                "id": "",
                "label": "",
                "notNull": false,
                "type": "REGULAR",
                "unit":null,
                "validator":null,
                "valueSet": [],
                "value": null
            };
            $.extend( obj, payload );
            var $el = $tblEdt.find(".tpl-sample-row").clone().addClass("val-row").removeClass("tpl-sample-row");
            $('span.var-id', $el).html(obj.id);
            $('span.var-label', $el).html(obj.label);
            $('span.var-description', $el).html(obj.description);
            $('span.var-dataType', $el).html(humanJavaDataType(obj.dataType));
            $('span.var-default', $el).html(obj.defaultValue);
            if((obj.value == null) || (obj.value === '') || (obj.value === undefined)){
                obj.value = obj.defaultValue;
            }
            if(obj.dataType === "java.lang.Boolean"){
                helper_putValue($el, obj.id, obj.dataType, obj.value, ["true","false"]);
            }else{
                helper_putValue($el, obj.id, obj.dataType, obj.value, obj.valueSet);
            }
            $tblEdt.append($el);
        };
        $.each(componentTemplate.parameterDescriptors, function(i, value) {
            helper_addSTblEdtRow($("#tbl-edt-sysvar"),value);
        });
        if(componentTemplate.parameterDescriptors.length > 0) $tblEdt.closest(".app-card").show();

        return 1;
    };
}());

/*
(function () {
    function f(v){
//      $.extend(q, v);
        return 1;
    }
    window.taoUI_UpdateUserProfile = f;
}());
*/
