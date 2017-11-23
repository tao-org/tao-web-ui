$("body").append(''+
'<!-- messages -->'+
	'<div id="messagesBox">'+
		'<div id="messagesBoxItemX" class="messagesBoxItem hidden" style="">Dummy message text.</div>'+
	'</div>'+
'<!-- messages -->');

(function ( $ ) {
	var my_messages_count = 0;
	$.fn.messagestack = function(options) {
			var o = {
				msg: "Dummy message, please write your own.",
				lifetime: 4000,
				closable:true
			};
			$.extend( o, options || {} );
			
			my_messages_count++;
			
			var collor_class = "";

			if(status == 'SUCCESS'){
				collor_class = " msg-green";
			}
			if(status == 'INFO'){
				collor_class = " msg-yellow";
			}
			if(status == 'WARN'){
				collor_class = " msg-yellow";
			}
			if(status == 'FAIL'){
				collor_class = " msg-red";
			}
			if(status == 'ERROR'){
				collor_class = " msg-red";
			}

			$(this).prepend('<div id="messagesBoxItem'+my_messages_count+'" class="messagesBoxItem'+collor_class+'">'+o.msg+'</div>');
			$('#messagesBoxItem'+my_messages_count).delay(o.lifetime).slideUp(function(){$(this).remove();});
			return this;
    };

}( jQuery ));
