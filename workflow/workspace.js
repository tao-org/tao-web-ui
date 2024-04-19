//create case insensitive search jQuery selector:
jQuery.expr[':'].ci_search = function(a, i, m) {
    return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};

//geometry function for svg
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

// get enums based on enum name
function getTaoEnums(name) {
	var retVal = [];
	$.each(wfTools.taoEnums, function (index, enm) {
		if (index.toLowerCase().indexOf(name.toLowerCase()) >= 0) {
			$.each(enm, function (idx, value) {
				retVal.push(value);
			});
		}
	});
	return retVal;
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



    var preferences = {};
	var componentCategories;

    var toolboxHeader = {
        elTBH: $("#toolboxHeader"),
        init: function () {
            var a = this;
            a.elTBH.on("click", ".toolbox-header-close", function(e){
                e.stopPropagation();
                a.close();
            });
            //intercept and cancell scroll events in order to stop propagate to parents
            $(a.elTBH).on( 'mousewheel DOMMouseScroll', function (e) {
                e.preventDefault();
            });
            return this;
        },
        populate: function(header){
            $(".val-title",this.elTBH).html(header.name);
            $(".val-meta",this.elTBH).html(header.status +",&nbsp;"+ header.visibility);
            return this;
        },
        open: function () {
            this.elTBH.removeClass("outside");
            return this;
        },
        close: function () {
            this.elTBH.addClass("outside");
            return this;
        }
    };
    toolboxHeader.init();

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
            componentCategories = getTaoEnums("ComponentCategory");
			$.each(componentCategories, function(index, category) {
				var $componentHeader = $("h3","#componentTemplate").clone().append(category.value).css('textTransform', 'capitalize');
				var $componentContent = $("#componentTemplateBody","#componentTemplate").clone().attr("id", category.key);
				$( ".toolboxAccordion", a.elTBS).append($componentHeader).append($componentContent);
			});
			
			
			//init accordion
            $( ".toolboxAccordion", a.elTBS).accordion({
                heightStyle: "fill",
                collapsible: true,
                active: false,
                animate: 500
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

            $( ".fa-search", a.elTBS).show();
            $( ".fa-times", a.elTBS).hide().on("click",function(){
                $(this).parent().find("input").val("").trigger("keyup");
            });

            a.elTBS.on('keyup','.toolbox-search>input', function(e){
                var q = $(this).val();
                var $s = $(this).parent();
                var $l = $s.next();
                if(q && q.length>0){
                    $( ".fa-search", $s).hide();
                    $( ".fa-times", $s).show();
                    $( "sortable_item", $l).hide();
                    $( ".item-label:ci_search('"+q+"')", $l).closest("sortable_item").show();
                }else{
                    $( ".fa-search", $s).show();
                    $( ".fa-times", $s).hide();
                    $( "sortable_item", $l).show();
                }
            });
			//opens drawable by default
            a.open();
        },
        open: function () {
            this.elTBS.removeClass("outside");
        },
        close: function () {
            this.elTBS.addClass("outside");
		},
		refresh: function() {
			$( ".toolboxAccordion",this.elTBS).accordion( "refresh" );
		}
    };


	function setWFConnectorsToStateMachine(){
		window.preferences.workFlowConnectors = "S";
		_settings.createCookie("preferences_workFlowConnectors","S");
	}
	function setWFConnectorsToFlowchart(){
		window.preferences.workFlowConnectors = "F";
		_settings.createCookie("preferences_workFlowConnectors","F");
	}

    function wf_renderComponentsToolBox(){
        var $elDatasurcesList = $("#datasourceslist");
        var $elUDatasurcesList = $("#udatasourceslist");		
        $elDatasurcesList.empty();
        $elUDatasurcesList.empty();
		$.each(componentCategories, function (index, tag) {
			var $elComponentsList = $("#moduleslist", "#" + tag.key);
			
			$elComponentsList.empty();
				
			$.each(wfTools.toolboxnodes.pc, function(i, item) {
				if ($elComponentsList.length !== 0 && (jQuery.inArray(tag.key, item.dna.tags) !== -1 || (typeof item.dna.category !== "undefined" && tag.key === item.dna.category))) {
					item.image = "./media/"+item.dna.containerId+".png";
					var html ='<sortable_item class="item selected" id="'+item.id+'" data-componentid="'+item.dna.id+'" data-componenttype="pc" data-toolboxid="'+item.id+'">\n' +
						'\t\t\t\t\t<div class="item-info">\n' +
						'\t\t\t\t\t  <div class="item-label text-left"> \n' +
						'\t\t\t\t\t\t<img src="'+item.image+'" style="width: 15%; height: 15%;">\n' +item.label+
						'\t\t\t\t\t</div>\n' +
						'\t\t\t\t\t</div>\n' +
						'\t\t\t\t</sortable_item>';
					$elComponentsList.append(html);
				} /*else if (typeof item.dna.category === "undefined" || jQuery.inArray(item.dna.category.toLowerCase(),componentCategories) < 0) {
					item.image = "./media/"+item.dna.containerId+".png";
					var html ='<sortable_item class="item selected" id="'+item.id+'" data-componentid="'+item.dna.id+'" data-componenttype="pc" data-toolboxid="'+item.id+'">\n' +
						'\t\t\t\t\t<div class="item-info">\n' +
						'\t\t\t\t\t  <div class="item-label text-left"> \n' +
						'\t\t\t\t\t\t<img src="'+item.image+'" style="width: 20%; height: 20%;">\n' +item.label+
						'\t\t\t\t\t</div>\n' +
						'\t\t\t\t\t</div>\n' +
						'\t\t\t\t</sortable_item>';
					$("#moduleslist", "#other").append(html); //default tag for all components marked as Other or have no tags from the predefined toolboxTagsList or no category defined
				}*/
			});
			if ($elComponentsList.children().length > 0) {
				$("h3[aria-controls='" + tag.key + "']").removeClass("hidden");
			}
		});
		// data source component category is removed from toolbox (is linked with app.js wfTools.datasources commented zones)
        /*$.each(wfTools.toolboxnodes.ds, function(i, item) {
            item.image = "./media/module-ds.png";
        	var html ='<sortable_item class="item selected" id = "'+item.id+'" data-componentid="'+item.dna.id+'" data-componenttype="ds" data-toolboxid="'+item.id+'">\n' +
                '\t\t\t\t\t<div class="item-info">\n' +
                '\t\t\t\t\t  <div class="item-label text-left"> \n' +
                '\t\t\t\t\t\t<img src="'+item.image+'" style="width: 15%; height: 15%;">\n' +item.label+
                '\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t</div>\n' +
                '\t\t\t\t</sortable_item>';
            $elDatasurcesList.append(html);
        });*/
        $.each(wfTools.toolboxnodes.uds, function(i, item) {
            item.image = "./media/module-ds.png";
            var html ='<sortable_item class="item selected" id = "'+item.id+'" data-componentid="'+item.dna.id+'" data-componenttype="uds" data-toolboxid="'+item.id+'">\n' +
                '\t\t\t\t\t<div class="item-info">\n' +
                '\t\t\t\t\t  <div class="item-label text-left"> \n' +
                '\t\t\t\t\t\t<img src="'+item.image+'" style="width: 15%; height: 15%;">\n' +item.label+
                '\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t</div>\n' +
                '\t\t\t\t</sortable_item>';
            $elUDatasurcesList.append(html);
        });

        //make toolbox items draggable & droppable
        $("#moduleslist .item, #datasourceslist .item, #udatasourceslist .item").draggable({
            revert: "invalid",
            helper: "clone",
            start: function(e, ui)
            {
                $(ui.helper).css('opacity', '0.5');
            }
        });
		$elCanvas.droppable({
			accept: "#moduleslist .item, #datasourceslist .item, #udatasourceslist .item",
			drop: function (event, ui) {
				if (event.which !== 1 || event.originalEvent.isTrigger) {
					console.log("node creation canceled by user");
					return;
				}
				var btop = (this.offsetHeight - this.scrollHeight) / 2 * wfZoom;
				var bleft = (this.offsetWidth - this.scrollWidth) / 2 * wfZoom;
				var top = (ui.offset.top - $(this).offset().top - btop) / wfZoom;
				var left = (ui.offset.left - $(this).offset().left - bleft) / wfZoom;

				//snap to grid (TODO: get defined grid size?)
				var xGrid = 20;//horizontal grid size
				var yGrid = 20;//vertical grid size
				var leftGridSpaces = Math.floor(left / xGrid);
				if (left % xGrid <= Math.floor(xGrid/2)) {
					left = leftGridSpaces * xGrid;
				}
				else {
					left = (leftGridSpaces + 1) * xGrid;
                }
				var topGridSpaces = Math.floor(top / 20);
				if (top % xGrid <= Math.floor(yGrid / 2)) {
					top = topGridSpaces * yGrid;
				}
				else {
					top = (topGridSpaces + 1) * yGrid;
				}			

                var toolboxId = $(ui.helper).data("toolboxid");
                var compType = $(ui.helper).data("componenttype");
                var initialName = wfTools.toolboxnodes[compType][toolboxId].label;
                var nodeData = {
                    "ntype": compType,
                    "ntemplateid": $(ui.helper).data("componentid"),
                    "mtype":"",
                    "mlabel":"No Name",
                    "fullData": {
                        componentId: $(ui.helper).data("componentid"),
                        componentType: (function(c){if(c==="ds") return "DATASOURCE"; if(c==="uds") return "DATASOURCE"; if(c==="pc") return "PROCESSING"}(compType)),
                        created: arrayFromDatetime(),
                        customValues:[],
                        //id:0, !!! do not send id!!!
                        incomingLinks:[],
                        level:0,
                        name:initialName,
                        xCoord:left,
                        yCoord:top,
                        behavior: "FAIL_ON_ERROR"
                    }
                };
                //adjust drop coordinates to conform pan&zoom
                //call tao_dropNewNode, it will save and render new node
                jsPlumb.fire("tao_dropNewNode", [nodeData, left, top]);
//				  $(this).append($(ui.helper).clone().draggable({
//					  containment: "parent"
//				  }));
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
				
				if(index === 0){
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
        	jsPlumb.fire("jsPlumbSetZoom", wfZoom);
			makeWFPreview();
    }
	
	//preview window
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
                itemOffset.selected = 0;
				itemOffset.w = $(this).outerWidth()*wfZoom;
				itemOffset.h = $(this).outerHeight()*wfZoom;
				itemOffset.right = $(this).offset().left + itemOffset.w;
				itemOffset.bottom = $(this).offset().top + itemOffset.h;
				if($(this).hasClass("selected")){
					itemOffset.selected = 1;
				}
                if($(this).hasClass("g")){
                    itemOffset.selected = -2;
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
        	var pHtml = '';
			$.each( nodes, function( key, itemMatrix ) {
				if(itemMatrix.selected === 1){
					pHtml += "<div class=\"preview-node selected\" style=\"top:"+(rezidualSpace.top+(itemMatrix.top-minTop)*previewScale)+"px;left:"+(rezidualSpace.left+(itemMatrix.left-minLeft)*previewScale)+"px;width:"+itemMatrix.w*previewScale+"px;height:"+itemMatrix.h*previewScale+"px\"></div>";
				}
				if(itemMatrix.selected === 0){
					pHtml += "<div class=\"preview-node\" style=\"top:"+(rezidualSpace.top+(itemMatrix.top-minTop)*previewScale)+"px;left:"+(rezidualSpace.left+(itemMatrix.left-minLeft)*previewScale)+"px;width:"+itemMatrix.w*previewScale+"px;height:"+itemMatrix.h*previewScale+"px\"></div>";
				}
                if(itemMatrix.selected === -2){
                    pHtml += "<div class=\"preview-node group\" style=\"top:"+(rezidualSpace.top+(itemMatrix.top-minTop)*previewScale)+"px;left:"+(rezidualSpace.left+(itemMatrix.left-minLeft)*previewScale)+"px;width:"+itemMatrix.w*previewScale+"px;height:"+itemMatrix.h*previewScale+"px\"></div>";
                }

				//add Viewfinder
				if(itemMatrix.selected === -1){
					pHtml += "<div class=\"preview-node viewfinder\" style=\"top:"+(rezidualSpace.top+(itemMatrix.top-minTop)*previewScale)+"px;left:"+(rezidualSpace.left+(itemMatrix.left-minLeft)*previewScale)+"px;width:"+itemMatrix.w*previewScale+"px;height:"+itemMatrix.h*previewScale+"px\"></div>";
				}
			});
        	$wfPreview.append(pHtml);
    }

	//prevent browser zooming on mouse scroll only.
	$(window).bind('mousewheel DOMMouseScroll', function (event) {
			if (event.ctrlKey === true) {
    			event.preventDefault();
			}
	});
	//prevent browser zooming on keyboard shortcuts.
	$(document).keydown(function(event) {
			//Ctrl + +
	   	    if (event.ctrlKey === true && (event.which === '61' || event.which === '107' || event.which === '187') ) {
				event.preventDefault();
				doWFZoom("zoom-plus");
			}
	   	    //Ctrl + -
			if (event.ctrlKey === true && (event.which === '173' || event.which === '109' || event.which === '189') ) {
				event.preventDefault();
				doWFZoom("zoom-minus");
			}
			//Ctrl + 1
			if (event.ctrlKey === true && (event.which === '49' || event.which === '35' || event.which === '97') ){
				event.preventDefault();
				doWFZoom("zoom-1to1");
			}
			if (event.ctrlKey === true && (event.which === '37' || event.which === '100') ){
				event.preventDefault();
				doWFPan("pan-right");
			}
			if (event.ctrlKey === true && (event.which === '39' || event.which === '102') ){
				event.preventDefault();
				doWFPan("pan-left");
			}
			if (event.ctrlKey === true && (event.which === '40' || event.which === '98') ){
				event.preventDefault();
				doWFPan("pan-up");
			}
			if (event.ctrlKey === true && (event.which === '38' || event.which === '104') ){
				event.preventDefault();
				doWFPan("pan-down");
			}
	});

$( function() {
	console.log("pref");
	if(_settings.readCookie("preferences_workFlowConnectors")){
		if(_settings.readCookie("preferences_workFlowConnectors") === "F"){
			setWFConnectorsToFlowchart();
		}
		if(_settings.readCookie("preferences_workFlowConnectors") === "S"){
			setWFConnectorsToStateMachine();
		}
	}else{
		setWFConnectorsToStateMachine();
	}

		toolboxModules.rescanBuild();
		$( "#tools-toolbox" ).draggable({ handle: "p" });
		$( "#draggable-toolbox-modules-source" ).draggable({ handle: "p" });
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
        $(document)
        .on('keyup', function(e){
            if(e.which === 46) {
                toolboxModules.rmSelected();
			}
			if (e.ctrlKey && (e.which == 37 || e.which == 100)) {//CTRL + left arrow
				toolboxModules.leftAlignSelected();
			}
			if (e.ctrlKey && (e.which == 38 || e.which == 104)) {//CTRL + up arrow
				toolboxModules.topAlignSelected();
			}
			if (e.ctrlKey && (e.which == 39 || e.which == 102)) {//CTRL + right arrow
				toolboxModules.rightAlignSelected();
			}
			if (e.ctrlKey && (e.which == 40 || e.which == 98)) {//CTRL + down arrow
				toolboxModules.bottomAlignSelected();
			}
        })
        .on('keyup keydown', function(e){
            keyboardShifted = e.shiftKey;
            shifted = e.shiftKey; ////???? xxx
        })
        .on('keydown', function(e){
            if (e.ctrlKey) {
                if (e.which === 65 || e.which === 97) { // 'A' or 'a'
                    e.preventDefault();
                    console.log("CTRL + A");
                    $(".w", $elCanvas).addClass("selected");
                    toolboxModules.rescanSelected();
                }
            }
        });

    //warn user before leaving page, nothing fancy for the moment, consider dirty flag for unsaved work
    window.addEventListener("beforeunload", function (e) {
        var confirmationMessage = "\o/";
        (e || window.event).returnValue = confirmationMessage;     //Gecko + IE
        return confirmationMessage;                                //Webkit, Safari, Chrome etc.
    });
});
	
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
		};
        
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
