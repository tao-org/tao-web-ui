	var prefferences = {};


    var toolboxSidebar = {
    	elTBS: $("#toolboxSidebar"),
        init: function () {
            var a = this;
    	    a.elTBS.on("click", ".toolbox-bar-close", function(e){
                e.stopPropagation();
    	        a.close();
            });
            a.elTBS.on("click", ".toolbox-sidebar-handler", function(){
                a.open();
            });
            a.elTBS.on("click", function(e){
                e.stopPropagation();
                if(a.elTBS.hasClass("outside")){
                    a.open();
                }
            });
            //init accordion
            $( ".toolboxAccordion", a.elTBS).accordion({
                heightStyle: "fill",
                collapsible: true,
                active: 1,
                animate: 500,
            });
            //add resize handler
            $( window )
            .resize(function() {
                $( ".toolboxAccordion", a.elTBS).accordion( "refresh" );
            });
            //intercept and cancell scroll events in order to stop propagate to parents
            $('.nano-content', a.elTBS).on( 'mousewheel DOMMouseScroll', function (e) {
                var e0 = e.originalEvent;
                var delta = e0.wheelDelta || -e0.detail;
                this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
                e.preventDefault();
            });
            a.open();
        },
        open: function () {
            this.elTBS.removeClass("outside");
        },
        close: function () {
            this.elTBS.addClass("outside");
		}
    };


	function setWFConnectorsToStateMachine(){
		window.prefferences.workFlowConnectors = "S";
		_settings.createCookie("prefferences_workFlowConnectors","S");
	}
	function setWFConnectorsToFlowchart(){
		window.prefferences.workFlowConnectors = "F";
		_settings.createCookie("prefferences_workFlowConnectors","F");
	}


    function wf_renderComponentsToolBox(){
        var $elComponentsList = $("#moduleslist");
        var $elDatasurcesList = $("#datasourceslist");
        $elComponentsList.empty();
        $elDatasurcesList.empty();
        $.each(wfTools.components, function(i, wfOneComponent) {
            var html ='<sortable_item class="item selected" id="'+wfOneComponent.id+'" data-componentid="'+wfOneComponent.id+'">\n' +
                '\t\t\t\t\t<div class="item-preview">\n' +
                '\t\t\t\t\t  <vectr_img page="0" src="" paused="true" style="display: block; width: 100%; height: 100%;">\n' +
                '\t\t\t\t\t\t<img src="media/module-otb.png" style="width: 100%; height: 100%;">\n' +
                '\t\t\t\t\t  </vectr_img>\n' +
                '\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t<div class="item-info">\n' +
                '\t\t\t\t\t  <div class="item-label text-left">'+wfOneComponent.label+'</div>\n' +
                '\t\t\t\t\t</div>\n' +
                '\t\t\t\t</sortable_item>';
            $elComponentsList.append(html);
        });
        $.each(wfTools.datasources, function(i, wfOneDatasource) {
            var hash = jsHashCode(wfOneDatasource.sensor+"::"+wfOneDatasource.dataSourceName);
            wfTools.datasources[i]['hash'] = hash;
            var html ='<sortable_item class="item selected" id="ds'+hash+'" data-componentid="ds'+hash+'">\n' +
                '\t\t\t\t\t<div class="item-preview">\n' +
                '\t\t\t\t\t  <vectr_img page="0" src="" paused="true" style="display: block; width: 100%; height: 100%;">\n' +
                '\t\t\t\t\t\t<img src="media/module-ds.png" style="width: 100%; height: 100%;">\n' +
                '\t\t\t\t\t  </vectr_img>\n' +
                '\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t<div class="item-info">\n' +
                '\t\t\t\t\t  <div class="item-label text-left">'+wfOneDatasource.dataSourceName+'<br>'+wfOneDatasource.sensor+'</div>\n' +
                '\t\t\t\t\t</div>\n' +
                '\t\t\t\t</sortable_item>';
            $elDatasurcesList.append(html);
        });


        $("#moduleslist .item, #datasourceslist .item").draggable({
            revert: "invalid",
            helper: "clone",
            start: function(e, ui)
            {
                $(ui.helper).css('opacity', '0.5');;
            }
        });
        $elCanvas.droppable({
            accept: "#moduleslist .item, #datasourceslist .item",
            drop: function (event, ui) {
                if (event.which != 1 || event.originalEvent.isTrigger){
                    console.log("node creation canceled by user");
                    return;
                }
                var btop   = (this.offsetHeight - this.scrollHeight)/2*wfZoom;
                var bleft  = (this.offsetWidth  - this.scrollWidth )/2*wfZoom;
                var top    = (ui.offset.top  - $(this).offset().top  - btop)/wfZoom;
                var left   = (ui.offset.left - $(this).offset().left - bleft)/wfZoom;

                var dna = {
                    fullData: {
                        componentId: $(ui.helper).data("componentid"),
                        created: [2018, 4, 15, 14, 21, 56, 0],
                        customValues:[],
                        id:0,
                        incomingLinks:[],
                        level:0,
                        name:"No Name",
                        xCoord:0,
                        yCoord:0
                    }

                }
                //npNewNode(ui.offset.left,ui.offset.top, dna);
                //adjust drop coordinates to conform pan&zoom
                addNewNode(left,top, dna);
//				  $(this).append($(ui.helper).clone().draggable({
//					  containment: "parent"
//				  }));
                makeWFPreview();
            }
        });
    }



    function tao_ZoomFitAllNodes() {
pz.panzoom('reset', { animate: false });
wfZoom = 1;
			console.log("f:fitCanvasToWindow");
			var minLeft			= 0;
			var minTop			= 0;
			var maxBottom		= 0;
			var maxRight		= 0;
			var spanY			= 0;
			var spanX			= 0;
			var nodes			= [];
			var itemOffset		= {};
			var theWindow = {};
			var canvasW = 10000;
			var canvasH = 10000;
			
			theWindow.w = window.innerWidth;
			theWindow.h = window.innerHeight;
				
			
			$(".w", $elCanvas).each(function(index) {
				itemOffset = {};
				itemOffset = $(this).offset();
				itemOffset.w = $(this).outerWidth()*wfZoom;
				itemOffset.h = $(this).outerHeight()*wfZoom;
				itemOffset.right = $(this).offset().left + itemOffset.w;
				itemOffset.bottom = $(this).offset().top + itemOffset.h;
//				if($(this).hasClass("selected")){		}
				
				if(index == 0){
					minLeft = itemOffset.left;
					minTop = itemOffset.top;
					maxBottom = itemOffset.bottom;
					maxRight = itemOffset.right;
				} 
				minLeft = Math.min(minLeft,itemOffset.left);
				minTop = Math.min(minTop,itemOffset.top);
				maxBottom = Math.max(maxBottom,itemOffset.bottom);
				maxRight = Math.max(maxRight,itemOffset.right);
				nodes.push(itemOffset);
            });
			
			spanX = maxRight-minLeft;
			spanY = maxBottom-minTop;
			
			console.log("minTop:"+minTop);
	
			wfZoom = Math.min(theWindow.w/spanX, theWindow.h/spanY);
			rezidualSpace = {
				left: (theWindow.w-spanX*wfZoom)/2,
				top: (theWindow.h-spanY*wfZoom)/2
			};
			//set it in motion


//var fitTop = parseInt(-minTop*wfZoom - (canvasH - canvasH*wfZoom)) - rezidualSpace.top/wfZoom;
        var fitTop = parseInt(-minTop*wfZoom - (canvasH - canvasH*wfZoom)/2) + rezidualSpace.top/wfZoom;
        var fitLeft = parseInt(-minLeft*wfZoom - (canvasW - canvasW*wfZoom)/2) + rezidualSpace.left/wfZoom;
//var fitLeft = -(1)*parseInt(minLeft*wfZoom + (canvasW - canvasW*wfZoom)/2) + rezidualSpace.left/wfZoom;
			
			
			var matrix = [wfZoom, 0, 0, wfZoom, fitLeft, fitTop];
			pz.panzoom("setMatrix", matrix);
            jsp.setZoom(wfZoom);
            $elZoom.html( parseInt(wfZoom*100) + "%");	
makeWFPreview();			
    };
	
	
	function makeWFPreview() {
			console.log("f:makeWFPreview");
            var $wfPreview		= $("#img-wf-preview");
			var wfPreviewSize	= 200;
			var minLeft			= 0;
			var minTop			= 0;
			var maxBottom		= 0;
			var maxRight		= 0;
			var spanY			= 0;
			var spanX			= 0;
			var nodes			= [];
			var itemOffset		= {};
			
			//fake node. viewport.
			itemOffset.left = 0;
			itemOffset.top = 0;
			itemOffset.bottom = itemOffset.top + window.innerHeight;
			itemOffset.right = itemOffset.left + window.innerWidth;
			itemOffset.w = window.innerWidth;
			itemOffset.h = window.innerHeight;
			itemOffset.selected = -1;
			nodes.push(itemOffset);
				
			minLeft = itemOffset.left;
			minTop = itemOffset.top;
			maxBottom = itemOffset.bottom;
			maxRight = itemOffset.right;
			//
			
			$(".w", $elCanvas).each(function(index) {
				//var itemOffset = getTopLeftOffset($(this));
				itemOffset = {};
				itemOffset = $(this).offset();
				itemOffset.w = $(this).outerWidth()*wfZoom;
				itemOffset.h = $(this).outerHeight()*wfZoom;
				itemOffset.right = $(this).offset().left + itemOffset.w;
				itemOffset.bottom = $(this).offset().top + itemOffset.h;
				if($(this).hasClass("selected")){
					itemOffset.selected = 1;
				}else{
					itemOffset.selected = 0;
				}
				
//				if(index == 0){
//					minLeft = itemOffset.left;
//					minTop = itemOffset.top;
//					maxBottom = itemOffset.bottom;
//					maxRight = itemOffset.right;
//				} 
				minLeft = Math.min(minLeft,itemOffset.left);
				minTop = Math.min(minTop,itemOffset.top);
				maxBottom = Math.max(maxBottom,itemOffset.bottom);
				maxRight = Math.max(maxRight,itemOffset.right);
				nodes.push(itemOffset);
            });
			
			spanX = maxRight-minLeft;
			spanY = maxBottom-minTop;
	
			previewScale = Math.min(wfPreviewSize/spanX, wfPreviewSize/spanY);
			rezidualSpace = {
				left: (wfPreviewSize-spanX*previewScale)/2,
				top: (wfPreviewSize-spanY*previewScale)/2
			};

			$wfPreview.empty();
			$.each( nodes, function( key, itemMatrix ) {
				if(itemMatrix.selected == 1){
					var pHtml = "<div class=\"preview-node selected\" style=\"top:"+(rezidualSpace.top+(itemMatrix.top-minTop)*previewScale)+"px;left:"+(rezidualSpace.left+(itemMatrix.left-minLeft)*previewScale)+"px;width:"+itemMatrix.w*previewScale+"px;height:"+itemMatrix.h*previewScale+"px\"></div>";
				};
				if(itemMatrix.selected == 0){
					var pHtml = "<div class=\"preview-node\" style=\"top:"+(rezidualSpace.top+(itemMatrix.top-minTop)*previewScale)+"px;left:"+(rezidualSpace.left+(itemMatrix.left-minLeft)*previewScale)+"px;width:"+itemMatrix.w*previewScale+"px;height:"+itemMatrix.h*previewScale+"px\"></div>";
				}
				//add Viewfinder
				if(itemMatrix.selected == -1){
					var pHtml = "<div class=\"preview-node viewfinder\" style=\"top:"+(rezidualSpace.top+(itemMatrix.top-minTop)*previewScale)+"px;left:"+(rezidualSpace.left+(itemMatrix.left-minLeft)*previewScale)+"px;width:"+itemMatrix.w*previewScale+"px;height:"+itemMatrix.h*previewScale+"px\"></div>";
				}
				$wfPreview.append(pHtml);
			});
    };



	//prevent browser zooming on mouse scroll only.
	$(window).bind('mousewheel DOMMouseScroll', function (event) {
			if (event.ctrlKey == true) {
			event.preventDefault();
			}
	});
	//prevent browser zooming on keyboard shortcuts.
	$(document).keydown(function(event) {
			//Ctrl + +
	   	    if (event.ctrlKey==true && (event.which == '61' || event.which == '107' || event.which == '187') ) {
				event.preventDefault();
				doWFZoom("zoom-plus");
			}
	   	    //Ctrl + -
			if (event.ctrlKey==true && (event.which == '173' || event.which == '109' || event.which == '189') ) {
				event.preventDefault();
				doWFZoom("zoom-minus");
			}
			//Ctrl + 1
			if (event.ctrlKey==true && (event.which == '49' || event.which == '35' || event.which == '97') ){
				event.preventDefault();
				doWFZoom("zoom-1to1");
			}
			if (event.ctrlKey==true && (event.which == '37' || event.which == '100') ){
				event.preventDefault();
				doWFPan("pan-right");
			}
			if (event.ctrlKey==true && (event.which == '39' || event.which == '102') ){
				event.preventDefault();
				doWFPan("pan-left");
			}
			if (event.ctrlKey==true && (event.which == '40' || event.which == '98') ){
				event.preventDefault();
				doWFPan("pan-up");
			}
			if (event.ctrlKey==true && (event.which == '38' || event.which == '104') ){
				event.preventDefault();
				doWFPan("pan-down");
			}
	});

$( function() {
	console.log("pref");
	if(_settings.readCookie("prefferences_workFlowConnectors")){
		if(_settings.readCookie("prefferences_workFlowConnectors") == "F"){
			setWFConnectorsToFlowchart();
		}
		if(_settings.readCookie("prefferences_workFlowConnectors") == "S"){
			setWFConnectorsToStateMachine();
		}
	}else{
		setWFConnectorsToStateMachine();
	};



		
	$("#moduleslist .item, #datasourceslist .item").draggable({
          revert: "invalid",
          helper: "clone",
		  start: function(e, ui)
				{
					$(ui.helper).css('opacity', '0.5');;
				}
    });
	$elCanvas.droppable({
			  accept: "#moduleslist .item, #datasourceslist .item",
			  drop: function (event, ui) {
				  if (event.which != 1 || event.originalEvent.isTrigger){
					  console.log("node creation canceled by user");
					  return;
				  }
		var btop   = (this.offsetHeight - this.scrollHeight)/2*wfZoom;
		var bleft  = (this.offsetWidth  - this.scrollWidth )/2*wfZoom;
		var top    = (ui.offset.top  - $(this).offset().top  - btop)/wfZoom;
		var left   = (ui.offset.left - $(this).offset().left - bleft)/wfZoom;
				  
				  var dna = $(ui.helper).data("dna");
				  //npNewNode(ui.offset.left,ui.offset.top, dna);
				  //adjust drop coordinates to conform pan&zoom
				  addNewNode(left,top, dna);
//				  $(this).append($(ui.helper).clone().draggable({
//					  containment: "parent"
//				  }));
				makeWFPreview();
			  }
	});
		
		toolboxModules.rescanBuild();
		$( "#tools-toolbox" ).draggable({ handle: "p" });
		$( "#draggable-toolbox-modules-source" ).draggable({ handle: "p" });
		$( "#draggable-toolbox-modules-properties" ).draggable({ handle: "p" });
		$( "#draggable-toolbox-preview" ).draggable({ handle: "p" });
		
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



