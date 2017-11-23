(function ( $ ) {
	
$("body").append(''+
'<div id="confirm-dialog" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">'+
  '<div class="modal-dialog modal-sm">'+
    '<!-- Modal Content: begins -->'+
    '<div class="modal-content">'+
      '<!-- Modal Body -->'+
      '<div class="modal-body">'+
        '<p class="body-message">Please confirm</p>'+
        '<p class="body-btn text-right">'+
          '<button type="button" class="btn btn-primary btn-flat confirm" data-dismiss="modal" style="margin-right: 5px;">' +
			'<i class="fa fa-check fa-fw"></i>' +
    		'Confirm</button>'+
		  '<button type="button" class="btn btn-primary btn-flat cancel" data-dismiss="modal">' +
    		'<i class="fa fa-times fa-fw"></i>' +
    		'Cancel</button>'+
        '</p>'+
      '</div>'+
    '</div>'+
    '<!-- Modal Content: ends -->'+
  '</div>'+
'</div>');

$('#confirm-dialog').modal({
							keyboard: false,
							backdrop: 'static',
							show: false
						});
$.fn.modal.Constructor.prototype.confirm = function(options) {

var o = {
    msg: "Please confirm",
    callbackConfirm: function() {return true;},
	callbackCancel: function() {return true;}
};
	$.extend( o, options || {} );

	if(o.msg){
		$(".body-message", "#confirm-dialog").html(o.msg);
	} 
	$('.btn.confirm').off('click').click(function(){
        if (typeof o.callbackConfirm === 'function') {
			o.callbackConfirm.call(this);
		}
    });
	$('.btn.cancel').off('click').click(function(){
        if (typeof o.callbackCancel === 'function') {
			o.callbackCancel.call(this);
		}
    });
	$.fn.modal.Constructor.prototype.show.apply(this, arguments);
};
}( jQuery ));
