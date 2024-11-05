(function ($, window) {
	'use strict';
	
	// WsController Class
	var WsController = function (element, options) {
		var _self = this;
		
		// Read user options (url and username)
		_self.options = $.extend({}, $.fn.wsController.defaults, options);

		// Create table element
		$(element).html('').attr("id", "wscontroller").addClass("wscontroller");
		_self.el = $(element);
		_self.ws = null;

		// promises
		var deferred = $.Deferred();
		_self.connect().then(function() { deferred.resolve(_self); });
		return deferred.promise();
	};
	
	WsController.prototype = {
		
		// Destroy control
		destroy: function (globalInstance) {
			var _self = this;
			_self.el.html("").attr("id", "").removeClass("wscontroller");
		},
		connect: function () {
			var _self = this;
			
			var deferred = $.Deferred();
				//_self.ws = new WebSocket(_self.options.url);
      			_self.ws = new SockJS(_self.options.url);

				_self.ws.onopen = function (event) {
					_self.ws.send([ 'SUBSCRIBE', 'id:1', 'destination:/queue/' + _self.options.user, '\n', null ].join('\n'));
					deferred.resolve(event);
				};
				_self.ws.onclose = function (event) {
					console.log("WebSockets closed with code: " + event.code);
					deferred.reject(event);
				}; 
				_self.ws.onerror = function (event) {
					console.log("WebSockets error: " + event.reason);
					deferred.reject(event);
				}; 
				_self.ws.onmessage = function (event) {
					_self.el.trigger("wsmessage", [ event.data ]);
				};
			return deferred.promise();
		},
		checkConnection: function(){
			var _self = this;

			//if((_self.ws.readyState === WebSocket.CLOSED) || (_self.ws.readyState === WebSocket.CLOSING)){
			if((_self.ws.readyState === WebSocket.CLOSED) || (_self.ws.readyState === WebSocket.CLOSING)){

				try{
					//_self.options.url = window.baseWssUrl + "queue?tokenKey=" + window.tokenKey;
					//_self.ws = new WebSocket(_self.options.url);
					_self.options.url = window.baseRestApiURL + "queue?tokenKey=" + window.tokenKey;
					_self.ws = new SockJS(_self.options.url);
					_self.ws.send([ 'SUBSCRIBE', 'id:1', 'destination:/queue/' + _self.options.user, '\n', null ].join('\n'));
				}catch(error){
					window.location.reload();
				}
			}
		}
	};
	
	$.fn.wsController = function (options) {
		return new WsController(this, options);
	};
	
	$.fn.wsController.defaults = {
		url : "",
		user: ""
	};

})(jQuery, window, document);


$(document).ready( function () {

	// create div and append it to hmtl
	var $wsc = $('<div></div>');
	$("body").append($wsc);

	// connect to endpoint
	// prepare the user id for subscribe message
	$wsc.wsController({
		//"url" : window.baseWssURL + "queue?tokenKey=" + window.tokenKey,
		"url" : window.baseRestApiURL + "queue?tokenKey=" + window.tokenKey,
		"user": taoUserProfile.id
	})
	.then(function (result) {	// the promise response is in a susccessful outcome (1 parameter)
		window.wsController = result;

		// when a message is received
		window.wsController.el.on("wsmessage", function (e, msg) {
			try {
				// parse the json data
				var dna = JSON.parse(msg);

				// check the user type
				if (typeof dna.user !== "undefined"){

					if(dna.user !== taoUserProfile.id){

						// resources
						switch (dna.topic) {
							case "resources":
								$('[ws-id="resources|SystemAccount|' + dna.source + '"]').trigger("wsmessage", [ dna.data ]);
								break;
						}
					}else{
						switch(dna.topic){
							
						// notifications
							case "info":
								$('.info-notif-menu, #bot-notice-chat').trigger("wsmessage", [ dna ]);
								break;
							case "warn":
								$('.execution-notif-menu, #bot-notice-chat').trigger("wsmessage", [ dna ]);
								break;
							case "error":
								$('.error-notif-menu').trigger("wsmessage", [ dna ]);
								break;
							case "transfer":
								if(dna.data.Payload.startsWith("Start") || dna.data.Payload.startsWith("Completed")){
									$('.info-notif-menu').trigger("wsmessage", [ dna ]);
								}
								$('[ws-id="transfer|' + dna.data.Repository + '"]').trigger("wsmessage", [ dna ]);
								break;
							
						// downloads 
							case "product.progress":
								if(dna.data.Payload.startsWith("Start") || dna.data.Payload.startsWith("Completed")){
									$('.info-notif-menu').trigger("wsmessage", [ dna ]);
								}
								$('#download-statistics-panel').trigger("wsmessage", [ dna ]);
								$('[ws-id="available_users|' + dna.user + '"]').trigger("wsmessage", [ dna ]);
								break;

						// running tasks 
							case "execution.status.changed":
								// execution notifications
								if(dna.source != null){
									$('.execution-notif-menu, #bot-notice-chat').trigger("wsmessage", [ dna ]);
								}
								// dashboard
								$('#exec-list-panel').trigger("wsmessage", [ dna ]);
								// available vms
								$('[ws-id="execution.status.changed|' + dna.data.host + '"]').trigger("wsmessage", [ dna ]);
								// available users
								$('[ws-id="available_users|' + dna.user + '"]').trigger("wsmessage", [ dna ]);
								break;

						// storage|cpu resources info 
							case "user.storage.resources":
							case "user.cpu.resources":
								$("#wrapper-quota").trigger("wsmessage", [ dna ]);
								break;
						}
					}
				}
			} catch (error) {
				console.error(error + "\nExpected JSON message");
			}
		});
	});
});