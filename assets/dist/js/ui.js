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
 * showMsg()                //show UI message in toast like notification
 *
 **/


//user identity scripts
//create user profile variable
var taoVersion = 140; //set a small value as default
var taoReferenceVersion = 200;
var taoUserProfile = {};
var taoUserGroups = {
    data: {},
    getById: function(id){
        id = parseInt(id);
        if (this.data) {
            r = _.where(this.data, {id: id});
                if(r[0]) return r[0];
            }
        return undefined;
    }
};
var taoFlavors = [];
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

var bootstrapSwitchSize = function (bodySize) {
	switch(bodySize) {
		case "size-small": return "mini"; break;
		case "size-normal": return "small"; break;
		case "size-large": return "normal"; break;
		case "size-larger": return "large"; break;
		default: return"small";
	}
};
var isOldVersion = false;


$(function () {
    var username = _settings.readCookie("TaoUserName");
    var userId = _settings.readCookie("TaoUserId");
	
    function getUserProfile(userId){
        return $.ajax({
            cache: false,
            url: baseRestApiURL + "user/"+ userId,
            dataType : 'json',
            type: 'GET',
            async: false,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Auth-Token": window.tokenKey
            }
        });
    }
    function getConfigEnums(){
        return $.ajax({
            cache: false,
            url: baseRestApiURL + "config/enums",
            dataType : 'json',
            type: 'GET',
            async: false,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Auth-Token": window.tokenKey
            }
        });
    }
    function getUserGroups(){
		// when user role is not Admin user groups is unauthorized
        if (typeof _settings.readCookie() !== "undefined" && _settings.readCookie("userRole") === "ADMIN") {
			return $.ajax({
				cache: false,
				async: false,
				crossDomain: true,
				url: baseRestApiURL + "admin/users/groups",
				dataType : 'json',
				method: 'GET',
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"X-Auth-Token": window.tokenKey
				}
			});
		} else {
			return [{"data":{},"message":null,"status":"SUCCEEDED"}];
		}
    }
	
	function getTaoVersion() {
		$.each(taoEnums.data.TAO, function (idx, obj) {
			if (obj.key === "version") {
				var snapshotStartIdx = obj.value.indexOf("-");
				if (snapshotStartIdx > 0) {
					taoVersion = parseInt(obj.value.substr(0, snapshotStartIdx).replaceAll(".", ""));
				} else {
					taoVersion = parseInt(obj.value.replaceAll(".", ""));
				}
				return false;
			}
		});
		isOldVersion = checkIfOldVersion()
	}

    $.when(getUserProfile(userId), getConfigEnums(),getUserGroups())

        .done(function (responseProfile, responseEnums, responseUserGroups) {
            var r = chkTSRF(responseProfile[0]);
            taoEnums.data = chkTSRF(responseEnums[0]);
			taoUserGroups.data = chkTSRF(responseUserGroups[0]);

            //inject additional elements into user profile data.
            if(r.id){
                taoUserProfile = r;
                taoUserProfile.userEmailMD5 = CryptoJS.MD5(r.email).toString();
                if(r.groups && r.groups[0]){
                    taoUserProfile.userRole = r.groups[0]["name"];
                }else{
                    alert("Your account membership has been revoked.\nYou are not a member of any user groups therefore you are denied access and you will be redirected to the login page.\nContact your TAO administrator to fix the account permissions.");
                    _settings.createCookie("tokenKey",'');
                    _settings.createCookie("userMatrix",'{}');
                    _settings.createCookie("refreshToken","");
                    _settings.createCookie("userRole","");
                    _settings.createCookie("TaoUserId","");
                    _settings.createCookie("TaoUserName","");
                    window.location = 'login.html';
                }
            }
			getTaoVersion();
            $(".val-user-fullname").html(taoUserProfile.lastName+" "+taoUserProfile.firstName);
            $(".val-user-role").html(taoUserProfile.userRole);
            $(".val-user-email").html(taoUserProfile.email);
            var gravatarUrl = "https://www.gravatar.com/avatar/"+taoUserProfile.userEmailMD5+"?d=mp&s=160";
            $(".val-user-avatar").attr("src", gravatarUrl);
            $(document).trigger( "quota:update" );
            //remove ui elements visible only to ADMIN role
            if (taoUserProfile.userRole !== "ADMIN") {
                $(".wrapper .admin-mode-only").remove();
            }
            $(".wrapper").fadeTo( "slow", 1, function() {});
        })
        .fail(function (jqXHR, status, textStatus) {
            _settings.createCookie("tokenKey",'');
            _settings.createCookie("userMatrix",'{}');
            _settings.createCookie("refreshToken","");
            _settings.createCookie("userRole","");
            _settings.createCookie("TaoUserId","");
            _settings.createCookie("TaoUserName","");
            window.location = 'login.html';
        });
});

(function(){
    var $elModalProfile = $("#myModalWorkFlow");
    function updateProfile(formData){
        var userData = {
            "id": 0,
            "username": "",
            "email": "",
            "alternativeEmail": "",
            "lastName": "",
            "firstName": "",
            "phone": "",
            "organization": ""
        };
        $.extend( userData, formData );

    	$.ajax({
    		 cache: false,
             url: baseRestApiURL + "user/"+userData.id,
             dataType : 'json',
             type: 'PUT',
             data: JSON.stringify(userData),
     		 async: false,
             headers: {
                 "Accept": "application/json",
                 "Content-Type": "application/json",
                 "X-Auth-Token": window.tokenKey
             },
    	 error : function (jqXHR, textStatus, errorThrown) {
             chkXHR(jqXHR.status);
         },
         success: function(r,textStatus, jqXHR) {
           	  console.log(r);
    		  r = chkTSRF(r);
    		  //inject additional elements into user profile data.
              if(r.id){
                  taoUserProfile = r;
                  taoUserProfile.userEmailMD5 = CryptoJS.MD5(r.email).toString();
                  if(r.groups && r.groups[0]){
                      taoUserProfile.userRole = r.groups[0]["name"];
                  }else{
                      alert("Your account membership has been revoked.\nYou are not a member of any user groups therefore you are denied access and you will be redirected to the login page.\nContact your TAO administrator to fix the account permissions.");
                      _settings.createCookie("tokenKey",'');
                      _settings.createCookie("userMatrix",'{}');
                      _settings.createCookie("refreshToken","");
                      _settings.createCookie("userRole","");
                      _settings.createCookie("TaoUserId","");
                      _settings.createCookie("TaoUserName","");
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
              showMsg("Your profile was successufuly updated.", "SUCCESS");
              $elModalProfile.modal("hide");
    	}
    	});
    	
    }
    
    function f(){
        $.ajax({ cache: false,
            url: "./fragments/profile.fragment.html"
        })
            .done(function (data) {
                $(".modal-dialog",$elModalProfile).html(data);
                var gravatarUrl = "https://www.gravatar.com/avatar/"+taoUserProfile.userEmailMD5+"?d=mp&s=160";
                $(".card-profile img",$elModalProfile).attr("src", gravatarUrl).css({'width':'50%', 'height':'50%'});
                $(".val-user-fullname",$elModalProfile).html(taoUserProfile.lastName+" "+taoUserProfile.firstName);

                $(".val-user-fname",$elModalProfile).html(taoUserProfile.firstName);
                $(".val-user-lname",$elModalProfile).html(taoUserProfile.lastName);

                $(".val-user-role",$elModalProfile).html(taoUserProfile.userRole);
                $(".val-user-email",$elModalProfile).html(taoUserProfile.email);
                $(".val-user-email2",$elModalProfile).html(taoUserProfile.alternativeEmail);
                $(".val-user-org",$elModalProfile).html(taoUserProfile.organization);
                $(".val-user-name",$elModalProfile).html(taoUserProfile.username);
                $(".val-user-phone",$elModalProfile).html(taoUserProfile.phone);
                $("[contenteditable]").css({"word-wrap":"break-word", "white-space": "pre-wrap"});
                
                $(".btn-edit-profile").on("click", function(){
                	if($(this).attr("data-action") === "edit"){//make divs available to edit
                		$(this).text('Save').attr("data-action","save");
                    	$.each($(".card-body div[contenteditable]"),function(){
                    		$(this).attr("contenteditable","true").css({"background":"#fff"});
                    	});
                	}else{
                		//save 
                	    var formData = {
                                "id" : taoUserProfile.id,
                                "username" : taoUserProfile.username,
                                "email" : $("div.val-user-email[contenteditable='true']").text(),
                                "alternativeEmail" : $("div.val-user-email2[contenteditable='true']").text(),
                                "lastName" : $("div.val-user-lname[contenteditable='true']").text(),
                                "firstName" : $("div.val-user-fname[contenteditable='true']").text(),
                                "phone" : $("div.val-user-phone[contenteditable='true']").text(),
                                "organization" : $("div.val-user-org[contenteditable='true']").text()
                            };
                		updateProfile(formData);
                	}
            	});
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
				//location.reload(true);
				window.location = 'login.html';
            })
            .fail(function(jqXHR, textStatus){
                console.log(jqXHR);
                console.log(textStatus);
                alert("Could not logout. It seems you are already logged out.");
            });
        taoUserProfile = {};
        _settings.createCookie("tokenKey",'');
        _settings.createCookie("userMatrix",'{}');
        _settings.createCookie("refreshToken","");
        _settings.createCookie("userRole","");
        _settings.createCookie("TaoUserId","");
        _settings.createCookie("TaoUserName","");

    });
}());

(function(){
    var $elQuota = $("#wrapper-quota");
    var $elQuotaSmall = $("#wrapper-quota-small");
    var q = {
        "input":-1,
        "inputActual":-1,
        "processing":-1,
        "processingActual":-1,
        "applicationTime": -1,
        "processingTime": -1
        //"used":0,
        //"um":" GB",
        //"files":0,
        //"folders":0
    };
    function ui_update(v){
        $.extend(q, v);
        // storage
        var lblInputQ = humanFileSizeFromMB(q.inputActual);
        var pctI = Math.ceil(q.inputActual/q.input*100);
        if(pctI>100){pctI = 100;}
        var lblInputPercent = pctI+"%";
        if(q.input === -1){
            //lblInputQ = "unmeterred";
            lblInputPercent = "n/a";
            pctI = 0;
        }
        // cpu
        var lblProcessingQ = q.processingActual+" CPUs"; //humanFileSizeFromMB(q.processing);
        var pctP = Math.ceil(q.processingActual/q.cpuQuota*100);
        if(pctP>100){pctP = 100;}
        var lblProcessingPercent = pctP+"%";
        if(q.cpuQuota === -1 || isNaN(pctP)){
            //lblProcessingQ = "unmeterred";
            lblProcessingPercent = "n/a";
            pctP = 0;
        }

        // on receiving a message
        $("#wrapper-quota").on("wsmessage", function (e, wsdna){
            
            var pctinputQ = pctI, pctprocessQ = pctP;

            switch(wsdna.topic){
                case "user.storage.resources":
                    var payload = wsdna.data.Payload;
                    lblInputQ = humanFileSizeFromMB(payload);
                    pctinputQ = Math.ceil(payload/q.input*100);
                    lblInputPercent = (q.input === -1)? "n/a" : pctinputQ +"%";
                    break;
                case "user.cpu.resources":
                    lblProcessingQ = wsdna.data.Payload + " CPUs";
                    pctprocessQ = Math.ceil(lblProcessingQ/q.cpuQuota*100);
                    if (isNaN(pctprocessQ)){
                        lblProcessingPercent = "n/a";
                        pctprocessQ = 0;
                    }else{
                        pctprocessQ +="%";
                    }
                    break;
            }

            var inputQ = 
            '        <h4 class="control-sidebar-subheading"><i class="fa fa-arrow-right fa-fw" aria-hidden="true"></i>storage:&nbsp;<span>'+lblInputQ+'</span><span class="label label-danger pull-right">'+lblInputPercent+'</span></h4>' +
            '        <div class="progress progress-xxs"><div class="progress-bar progress-bar-danger progress-bar-graph" style="width: '+pctinputQ+'%;"></div></div>';

            var processQ = 
            '        <h4 class="control-sidebar-subheading"><i class="fa fa-bolt fa-fw" aria-hidden="true"></i>processing:&nbsp;<span>'+lblProcessingQ+'</span><span class="label label-danger pull-right">'+lblProcessingPercent+'</span></h4>' +
            '        <div class="progress progress-xxs"><div class="progress-bar progress-bar-danger progress-bar-graph" style="width: '+pctprocessQ+'%;"></div></div>';
            
            var usageHTML =
            '        <h4 class="control-sidebar-subheading">Resource usage:</h4>' + inputQ + processQ;
           
            $elQuota.find("a.holder").empty().html(usageHTML);
            $elQuotaSmall.find(".arc1").attr("d",describeArc(20, 20, 16, 0, (pctinputQ>=100?99.99:pctinputQ)/100*360));
            $elQuotaSmall.find(".arc2").attr("d",describeArc(20, 20, 9, 0, (pctprocessQ>=100?99.99:pctprocessQ)/100*360));
            $elQuotaSmall.find(".quota-icon").attr("data-original-title", '<div class="quota-tool-tip">'+usageHTML+'</div>');
        });

//      var quota_usage_details = "using: "+q.used+"GB<br>"+q.files+" Files, "+q.folders+" Folders";

        var usageHTML =
            '        <h4 class="control-sidebar-subheading">Resource usage:</h4>' +
            '        <h4 class="control-sidebar-subheading"><i class="fa fa-arrow-right fa-fw" aria-hidden="true"></i>storage:&nbsp;<span>'+lblInputQ+'</span><span class="label label-danger pull-right">'+lblInputPercent+'</span></h4>' +
            '        <div class="progress progress-xxs"><div class="progress-bar progress-bar-danger progress-bar-graph" style="width: '+pctI+'%;"></div></div>' +
            '        <h4 class="control-sidebar-subheading"><i class="fa fa-bolt fa-fw" aria-hidden="true"></i>processing:&nbsp;<span>'+lblProcessingQ+'</span><span class="label label-danger pull-right">'+lblProcessingPercent+'</span></h4>' +
            '        <div class="progress progress-xxs"><div class="progress-bar progress-bar-danger progress-bar-graph" style="width: '+pctP+'%;"></div></div>';
//            '        <p style="color: #4b646f;"><small>'+quota_usage_details+'</small></p>';
        $elQuota.find("a.holder").empty().html(usageHTML);
        $elQuotaSmall.find(".arc1").attr("d",describeArc(20, 20, 16, 0, (pctI>=100?99.99:pctI)/100*360));
        $elQuotaSmall.find(".arc2").attr("d",describeArc(20, 20, 9, 0, (pctP>=100?99.99:pctP)/100*360));
        $elQuotaSmall.find(".quota-icon").attr("data-original-title", '<div class="quota-tool-tip">'+usageHTML+'</div>');

        //applicationTime & processingTime
        timer = (q.applicationTime <= 0 || isNaN(q.applicationTime))? '0d 0h 0m': getTime(q.applicationTime);
        processed =  (q.processingTime <= 0 || isNaN(q.processingTime))? '0d 0h 0m': getTime(q.processingTime);

        var $elQuotaTime = $("#wrapper-quota-time");
        usageHTML =
            '        <h4 class="control-sidebar-subheading">Time usage:</h4>' +
            '        <h4 class="control-sidebar-subheading"><i class="fa fa-clock-o fa-fw" aria-hidden="true"></i>spent:&nbsp;<span>'+timer+'</h4>' +
            '        <div class="progress progress-xxs"><div class="progress-bar progress-bar-info progress-bar-graph" style="width: 0%;"></div></div>' +
            '        <h4 class="control-sidebar-subheading"><i class="fa fa-bolt fa-fw" aria-hidden="true"></i>processing:&nbsp;<span>'+processed+'</h4>' +
            '        <div class="progress progress-xxs"><div class="progress-bar progress-bar-info progress-bar-graph" style="width: 0%;"></div></div>';
            
        $elQuotaTime.find("a.holder").empty().html(usageHTML);
        return true;
    }

    function f(){
        var headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.tokenKey
        };
        /*function getUserFiles(){
            return $.ajax({ cache: false,
                url: baseRestApiURL + "files/user/",
                dataType : 'json',
                type: 'GET',
                headers: headers
            });
        }*/
        function getProfileSettings(){
            return $.ajax({
                cache: false,
                url: baseRestApiURL + "user/"+taoUserProfile.id,
                dataType : 'json',
                type: 'GET',
                async: false,
                headers: headers
            });
        }

        $.when(getProfileSettings())
            .done(function (getProfileSettingsResponse) {
                //update user profile
				taoUserProfile.inputQuota = getProfileSettingsResponse.data.inputQuota;
                taoUserProfile.actualInputQuota = getProfileSettingsResponse.data.actualInputQuota;
                taoUserProfile.processingQuota = getProfileSettingsResponse.data.processingQuota;
                taoUserProfile.actualProcessingQuota = getProfileSettingsResponse.data.actualProcessingQuota;
                taoUserProfile.cpuQuota = getProfileSettingsResponse.data.cpuQuota;
                taoUserProfile.applicationTime = getProfileSettingsResponse.data.applicationTime;
                taoUserProfile.processingTime = getProfileSettingsResponse.data.processingTime;
                ui_update({
                    "input":parseFloat(taoUserProfile.inputQuota),
                    "inputActual":parseFloat(taoUserProfile.actualInputQuota),
                    "processing":parseFloat(taoUserProfile.processingQuota),
                    "processingActual":parseFloat(taoUserProfile.actualProcessingQuota),
                    "cpuQuota":parseInt(taoUserProfile.cpuQuota),
                    "applicationTime": parseInt(taoUserProfile.applicationTime),
                    "processingTime": parseInt(taoUserProfile.processingTime)
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
    //var version = '0.3',
    //    $elMsgBox = $("#messagesBox"),
    //    my_messages_index = 0;
	//function checkLocked() {
	//	if ($(".messagesBoxItem.locked", $elMsgBox).length > 0) {
	//		$elMsgBox.addClass("locked");
	//	} else {
	//		$elMsgBox.removeClass("locked");
	//	}
	//}
	//function messagestack(msg, status) {
	//	var o = {
	//		msg     : msg,
	//		status  : status,
	//		lifetime: 4000,
	//		closable: true
	//	};
		
	//	// Set message color
	//	var collor_class = "";
	//	switch (o.status.toUpperCase()) {
	//		case 'SUCCESS': collor_class = " msg-green" ; break;
	//		case 'INFO'   : collor_class = " msg-blue"  ; break;
	//		case 'WARN'   : collor_class = " msg-yellow"; break;
	//		case 'WARNING': collor_class = " msg-yellow"; break;
	//		case 'FAIL'   : collor_class = " msg-red locked"; o.closable = false; break;
	//		case 'FAILED' : collor_class = " msg-red locked"; o.closable = false; break;
	//		case 'ERROR'  : collor_class = " msg-red locked"; o.closable = false; break;
	//	}
		
	//	// Set message ID
	//	my_messages_index++;
		
	//	// Add message to stack
	//	$elMsgBox.append('<div id="messagesBoxItem'+my_messages_index+'" class="messagesBoxItem'+collor_class+'"><span class="glyphicon glyphicon-remove"></span>'+o.msg+'</div>');
		
	//	// Manual close
	//	$elMsgBox.on("click", "#messagesBoxItem"+my_messages_index+" span.glyphicon-remove", function () {
	//		$(this).closest(".messagesBoxItem").remove();
	//		checkLocked();
	//	});
		
	//	// Automatic close
	//	if (o.closable) { $('#messagesBoxItem'+my_messages_index).delay(o.lifetime).fadeOut(function () { $(this).remove(); checkLocked(); }); }
	//	checkLocked();
    //}
    //window.showMsg=messagestack;

    //VPA 2022.08 Added Gritter for notifications
    function showGritterMessage(message, title) {
        $.gritter.add({
            title: title,
            text: message,
            sticky: false,
            time: 2000
        });
    }
    function showGritterInfo(message, title) {
        $.gritter.add({
            title: title,
            text: message,
            sticky: false,
            class_name: 'gritter-info',
            time: 2000
        });
    }
    function showGritterWarning(message, title) {
        $.gritter.add({
            title: title,
            text: message,
            sticky: false,
            class_name: 'gritter-warning',
            time: 3000
        });
    }
    function showGritterError(message, title) {
        $.gritter.add({
            title: title,//the heading of the notification
            text: message,//the text inside the notification
            sticky: true,
            class_name: 'gritter-danger'
        });
    }  
    function showGritter(message, status) {
        if(typeof status !== 'undefined'){
            switch (status.toUpperCase()) {
                case 'SUCCESS': showGritterMessage(message, status); break;
                case 'INFO': showGritterInfo(message, status);collor_class = " msg-blue"; break;
                case 'WARN': showGritterWarning(message, status);collor_class = " msg-yellow"; break;
                case 'WARNING': showGritterWarning(message, status);collor_class = " msg-yellow"; break;
                case 'FAIL': showGritterError(message, status);collor_class = " msg-red locked"; break;
                case 'FAILED': showGritterError(message, status);collor_class = " msg-red locked"; break;
                case 'ERROR': showGritterError(message, status);collor_class = " msg-red locked"; break;
            }
        }
    }
    window.showMsg = showGritter;
	return this;
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
    window.showMsgOld=f;
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
                "Content-Type": "application/json",
				"X-Auth-Token": window.tokenKey
            }
        })
        .done(function (r, statusText, xhr) {
            var getMonitorNotificationResponse = chkTSRF(r);
            // console.log(getMonitorNotificationResponse);
            // var flagExecRefresh = false;
            for(k=0;k<getMonitorNotificationResponse.length; k++){
                    if(!$elChatBox.is(':visible')){
                        $elChatBox.slideDown();
                    }
                    var $el = $elClonable.clone();
                    $el.removeClass("master").removeClass("hidden");
                    $el.find(".val-msg-ts").html(niceIsoTime(getMonitorNotificationResponse[k]['timestamp']));
                    try {
                        // var n = getMonitorNotificationResponse[k]['data'].indexOf("Job");
                        // if(n !== -1){
                        //     flagExecRefresh = true;
                        // }
                        var obj = JSON.parse(getMonitorNotificationResponse[k]['data']);
                        if (obj.Message) {
                            $el.find(".val-msg-txt").html(obj.Message);
                            $($el).prependTo(".direct-chat-messages", "#bot-notice-chat");
                        }else{
                            if(obj.Payload){
                                $el.find(".val-msg-txt").html(obj.Payload);
                                $($el).prependTo(".direct-chat-messages", "#bot-notice-chat");
                            }
                        }
                    }
                    catch(err) {
                        // $el.find(".val-msg-txt").html("unparsable message");
                        // console.log("message unparsable");
                        console.log(getMonitorNotificationResponse);
                    }
                    var count = $(".direct-chat-messages > .direct-chat-msg").length;
                    if(count>notificationsMaxNumber){
                        $('.direct-chat-messages > .direct-chat-msg:last').remove();
                        $(".val-msgcount", "#bot-notice-chat").html(notificationsMaxNumber+"+");
                        $(".max-msg-note").removeClass("hidden");
                    } else{
                        $elMsgCount.html(count);
                    }
            }
           //if(flagExecRefresh){
               $("#exec-list-panel, #exec-history-panel, #notification-history-panel, #download-statistics-panel, #exec-user-list-panel, #exec-user-history-panel").trigger("panel:refresh");
           //}
           
           $("#bot-notice-chat").on("wsmessage", function (e, wsdna) {
                
                // make the pop up appear if it is not visible 
                if(!$elChatBox.is(':visible')){
                    $elChatBox.slideDown();
                }  

                // format date
                formatDate = moment(wsdna.timestamp).format("YYYY-MM-DD HH:mm:ss");

                // create html box for each notification 
                var $el = $elClonable.clone();
                $el.removeClass("master").removeClass("hidden");
                $el.find(".val-msg-ts").html(formatDate);

                // check type of notification message, then set data
                if(wsdna.data.Message){
                    $el.find(".val-msg-txt").html(wsdna.data.Message);
                } else if(wsdna.data.Payload){
                    $el.find(".val-msg-txt").html(wsdna.data.Payload);
                }else{
                    $el.find(".val-msg-txt").html("N/A");
                }

                // append the html to box
                $($el).prependTo(".direct-chat-messages", "#bot-notice-chat");

                // update the notification number
                var count = $(".direct-chat-messages > .direct-chat-msg").length;
                if(count>notificationsMaxNumber){
                    $('.direct-chat-messages > .direct-chat-msg:last').remove();
                    $(".val-msgcount", "#bot-notice-chat").html(notificationsMaxNumber+"+");
                    $(".max-msg-note").removeClass("hidden");
                } else{
                    $elMsgCount.html(count);
                }
           });
        })
        .fail(function (jqXHR) {
            chkXHR(jqXHR.status);
        })
        .complete(function(){
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
	$(".content-wrapper.tao-async-cw").on('mouseover', ".nodes-item-core-box .box-title span", function(event) {
		  var target = event.target;
		 // if (!target.matches('[title]')) return;

		  var container = target.parentNode;
		  var overflowed = container.scrollWidth > container.clientWidth;

		  target.title = overflowed ? target.textContent : '';
		});
	retriveNotifications();
    return true;
}());


//customize paremeters for workflow
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
                if(type === "date"){
                    $('input.var-value-string', $el).attr("type", "date");
                }
                if((type === "double") || (type === "short") || (type === "float") || (type === "number")){
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
                "dataType": "string",
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
            $('span.var-dataType', $el).html(obj.dataType);
            $('span.var-default', $el).html(obj.defaultValue);
            if((obj.value == null) || (obj.value === '') || (obj.value === undefined)){
                obj.value = obj.defaultValue;
            }
            if(obj.dataType === "bool"){
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
