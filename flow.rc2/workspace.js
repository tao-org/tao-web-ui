	$( function() {
		
	$("#moduleslist .item, #datasourceslist .item").draggable({
          revert: "invalid",
          helper: "clone",
		  start: function(e, ui)
				{
					$(ui.helper).css('opacity', '0.5');;
				}
    });
	$(".jtk-demo-canvas").droppable({
			  accept: "#moduleslist .item, #datasourceslist .item",
			  drop: function (event, ui) {
				  var dna = $(ui.helper).data("dna");
				  npNewNode(ui.offset.left,ui.offset.top, dna);
//				  $(this).append($(ui.helper).clone().draggable({
//					  containment: "parent"
//				  }));
			  }
	});
		
		toolboxModules.rescanBuild();
		$( "#tools-toolbox" ).draggable({ handle: "p" });
		$( "#draggable-toolbox-modules-source" ).draggable({ handle: "p" });
		$( "#draggable-toolbox-modules-properties" ).draggable({ handle: "p" });
		$( "#draggable-toolbox-modules" ).draggable({ handle: "p" });
		$( "#selectable" ).selectable({
											selected: function( event, ui ) {
												console.log("selected????");
												var dna = $(ui.selected).data("dna");
												$("#"+dna.blockid).addClass("selected");
											},
											start: function( event, ui ) {
												console.log("select start");
												$(".w").each(function() {
																	$(this).removeClass("selected");
																});
											},
											stop: function( event, ui ) {
												console.log("select stop");
												toolboxModules.rescanSelected();
											}
									});
		$('html').keyup(function(e){
											if(e.keyCode == 46) {
												toolboxModules.rmSelected();
											}
									});
		$( "body" ).on( "click", "#np-add-block", function() {
			npNewNode(250,250);
		});
		
		$(document).on('keyup keydown', function(e){shifted = e.shiftKey} );
	});
	
//geometry function for svg
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle){
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);
  var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
  return d = [
    "M", start.x, start.y, 
    "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
    //"L", x, y, "Z"
  ].join(" ");
}


////////////// FOR RUBER BAND ////////////
        var startPoint = {};
		var rubberBand = {
			"start":{},
			"visible":false,
			paint: function(statespace){
				$("#rubberband").css({top:statespace.top, left:statespace.left, height:statespace.h, width:statespace.w, position:'absolute'});
				if(rubberBand.visible) {
					$("#rubberband").show();
				}else{
					$("#rubberband").hide();
				}
				return true;
			},  
			mouseDown: function(event) {
				//if(envVars.selectenable === false){return;} //check if select mode enabled
				rubberBand.start = {"x": event.pageX, "y": event.pageY};
				startPoint.x = event.pageX;
				startPoint.y = event.pageY;
				rubberBand.visible = true;
				rubberBand.paint({top:startPoint.y, left:startPoint.x, h:1,w:1});
				console.log("rubber:mouse down");
				return true;
			},
			mouseUp: function(event) {
				if(!rubberBand.visible){ return; }
				rubberBand.visible = false;
				//if(envVars.selectenable === false){return;} //check if select mode enabled
				//diagramContainer_FindSelectedItem();
				$("#rubberband").hide();
				console.log("rubber:mouse up");
			},
			mouseMove: function(event) {
				//if(envVars.selectenable === false){return;} //check if select mode enabled
				if(!rubberBand.visible){ return; }
				
				
				
				var t = (event.pageY > startPoint.y) ? startPoint.y : event.pageY;
				var l = (event.pageX >= startPoint.x) ? startPoint.x : event.pageX;
				
				wcalc = event.pageX - startPoint.x;
				var w = (event.pageX > startPoint.x) ? wcalc : (wcalc * -1); 
				
				hcalc = event.pageY - startPoint.y;
				var h = (event.pageY > startPoint.y) ? hcalc : (hcalc * -1); 

				rubberBand.paint({top:t, left:l, h:h,w:w});
				$("#infoband").html("top:"+t+", left:"+l+", height:"+h+", width:"+w);
			}
		}
        
		function diagramContainer_FindSelectedItem() {
            if($("#rubberband").is(":visible") !== true) { return; }
            var rubberbandOffset = getTopLeftOffset($("#rubberband"));
			
            $(".item").each(function() {
                var itemOffset = getTopLeftOffset($(this));
                if( itemOffset.top > rubberbandOffset.top &&
                    itemOffset.left > rubberbandOffset.left &&
                    itemOffset.right < rubberbandOffset.right &&
                    itemOffset.bottom < rubberbandOffset.bottom) {
                    
					$(this).addClass("selected");
                    var elementid = $(this).attr('id');
                    jsPlumb.addToDragSelection(elementid);
					toolboxModules.rescanSelected();
                }
            });
			return;
        }
		function getTopLeftOffset(element) {
            var elementDimension = {};
            elementDimension.left = element.offset().left;
            elementDimension.top =  element.offset().top;
            elementDimension.right = elementDimension.left + element.outerWidth();
            elementDimension.bottom = elementDimension.top + element.outerHeight();
            return elementDimension;
        }
		function diagramContainer_Click(event) {
            if(startPoint.x === event.pageX && startPoint.y === event.pageY)
            {
                toolboxModules.clearAllSelectedModules();
				jsPlumb.clearDragSelection();
                $(".item").each(function() {
                    $(this).removeClass("selected");
                });
            }
        }
