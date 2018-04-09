var npNewNode;
var npDelNode;
var wfZoom = 1;
var minScale = 0.1;
var maxScale = 10;
var incScale = 0.1;
var keyboardShifted = false;

//used elements
var $elCanvas = $("#canvas");
var $elZoom = $(".zoom-percent span", "#preview-toolbar");

$(document)
	.on('keyup keydown', function(e){
			keyboardShifted = e.shiftKey;
	})
	.on('keydown', function(e){
			if (e.ctrlKey) {
				if (e.keyCode == 65 || e.keyCode == 97) { // 'A' or 'a'
					e.preventDefault();
					console.log("CTRL + A");
					$(".w", $elCanvas).addClass("selected");
					toolboxModules.rescanSelected();
				}
			}
	});
										
var toolboxProperties ={
	showProperties: function(dna){
		$("#draggable-toolbox-modules-properties section").hide();
		if(dna.payload.mtype == undefined){
			$("#draggable-toolbox-modules-properties section.tpl-unknown").show();
		}else{
				var tpl_notfound = true;
				//if(dna.payload.mtype == "ds-SciHubSentinel-1"){
//					$("#draggable-toolbox-modules-properties section.tpl-ds").show();
				//}
				if(dna.payload.mtype == "ds-SciHubSentinel-2"){
					tpl_notfound = false;
					$("#draggable-toolbox-modules-properties section.tpl-ds").show();
				}
				if(dna.payload.mtype == "otb-BandMath"){
					tpl_notfound = false;
					$("#draggable-toolbox-modules-properties section.tpl-otb-bm").show();
				}
				if(dna.payload.mtype == "otb-ConcatenateImages"){
					tpl_notfound = false;
					$("#draggable-toolbox-modules-properties section.tpl-otb-concat").show();
				}
				//not found
				if(tpl_notfound){
					$("#draggable-toolbox-modules-properties section.tpl-unknown").show();
				}
		}
	},
	showPropertiesMultiple: function(dna){
		$("#draggable-toolbox-modules-properties section").hide();
		$("#draggable-toolbox-modules-properties section.tpl-multiple").show();
	},
	showPropertiesNone: function(dna){
		$("#draggable-toolbox-modules-properties section").hide();
		$("#draggable-toolbox-modules-properties section.tpl-none").show();
	}
};
				

var toolboxModules ={
	selected: [],
	count: 0,
	rmSelected: function(){
		if(toolboxModules.selected.length == 0) {return;}
		jsp.clearDragSelection();
		$.each(toolboxModules.selected, function(index, item) {
                    npDelNode(item);
					$("#mti_" + item).remove();
        });
		toolboxModules.selected = [];
		makeWFPreview();
	},
	newModule: function(n){
		$( "#selectable" ).append( '<li id="mti_'+n.blockid+'" class="ui-widget-content" data-dna='+JSON.stringify(n)+'>Item '+n.blockid+'</li>' );
	},
	rescanSelected: function(){
		toolboxModules.selected = [];
		jsp.clearDragSelection();
		$(".w.selected").each(function() {
                    var elementid = $(this).attr('id');
					toolboxModules.selected.push(elementid);
					jsp.addToDragSelection(elementid);
        });
		if(toolboxModules.selected.length == 1){
			///xxxxxxxxxxx
			var dna = $("#"+toolboxModules.selected[0]).data("dna");
			toolboxProperties.showProperties(dna);
		}
		if(toolboxModules.selected.length > 1){
			toolboxProperties.showPropertiesMultiple();
		}
		if(toolboxModules.selected.length == 0){
			toolboxProperties.showPropertiesNone();
		}
		makeWFPreview();
	},
	rescanBuild: function(){
		toolboxModules.selected = [];
		$("#selectable").empty();
		$(".w").each(function() {
                    var dna = $(this).attr('dna');
					var id = $(this).attr('id');
					if(dna == undefined){ //if wrongly defined corect module dna data
						dna = {
								"type":"stdBlock",
								"blockid":id,
								"draggable":true,
								"resizable":true,
								"payload":{}
								};
					}
					
					$( "#selectable" ).append( '<li id="mti_'+id+'" class="ui-widget-content" data-dna='+JSON.stringify(dna)+'>Item '+id+'</li>' );
        });
	}
}


jsPlumb.bind("jsPlumbDemoLoaded", function(instance) {

});

/************************************************jsplumb******************************************/
jsPlumb.ready(function () {

    //panZoom
    // Define Pan / Zoom actions
    window.pz = $elCanvas.panzoom({
//        minScale             : minScale,
//        maxScale             : maxScale,
//        increment            : incScale,
        ignoreChildrensEvents: true,
        disablePan           : true,
        disableZoom          : false,
        startTransform: 'scale(1.0)'
    })
	.on("panzoomstart",function(e,pzoom,ev){
      $elCanvas.css("cursor","move");
    }).on("panzoomend",function(e,pzoom){
      $elCanvas.css("cursor","");
    });


////////////////////////////////////
	pz.parent()
        .on('mousewheel.focal', function(e) {
            // Zoom canvas when CTRL + MouseWheel
            if (e.ctrlKey || e.originalEvent.ctrlKey) {
                e.preventDefault();
                var delta = e.delta || e.originalEvent.wheelDelta;
                var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;

                // enable pan in order to also enable focal zoom
                pz.panzoom('option', 'disablePan', false);
                pz.panzoom('zoom', zoomOut, { animate: true, exponential: false, focal: e });
				pz.panzoom('option', 'disablePan', true);
                // Set jsPlumb zoom level
                var matrix = pz.panzoom('getMatrix');
                wfZoom = parseFloat(matrix[0]);
                jsp.setZoom(wfZoom);
                $elZoom.html( parseInt(wfZoom*100) + "%");
				makeWFPreview();
            }
        })
        .on("mousedown touchstart", function(e) {
            if (e.which != 1) return;
            if ($(e.target).closest(".group-container").length > 0 ||
                $(e.target).hasClass("panzoom-button")) return;

            // Start canvas pan / select
            if (e.ctrlKey && e.which == 1) {
                window.selectStart = { x: e.pageX, y: e.pageY };
            } else if (e.which == 1) {
                var matrix = pz.panzoom('getMatrix');
                var offsetX = parseInt(matrix[4]);
                var offsetY = parseInt(matrix[5]);
                window.panStart = { x: e.pageX, y: e.pageY, dx: offsetX, dy: offsetY };
                $(e.target).css("cursor", "move");
            }
        })
        .on("mousemove touchmove", function(e) {
            // Canvas pan
            if (window.panStart) {
                var deltaX = window.panStart.x - e.pageX;
                var deltaY = window.panStart.y - e.pageY;
                var matrix = pz.panzoom('getMatrix');
                matrix[4] = window.panStart.dx - deltaX;
                matrix[5] = window.panStart.dy - deltaY;
                pz.panzoom("setMatrix", matrix);
            } else if (window.selectStart) {
                drawSelectRectangle(window.selectStart, { x: e.pageX, y: e.pageY });
            }
        })
        .on("mouseup touchend touchcancel", function(e) {
            // End canvas pan and Clear resource selection
            if (e.target.id == pz[0].id) {
                if (window.panStart) {
                    var deltaX = 0;
                    var deltaY = 0;
                    var deltaX = window.panStart.x - e.pageX;
                    var deltaY = window.panStart.y - e.pageY;
                    if (deltaX == 0 && deltaY == 0) {
                        //clearGroupSelection();
                    }
                }
            }
            if (window.selectStart) {
                $("#select-rectangle").addClass("hidden");
            }
            window.panStart = null;
            window.selectStart = null;
            $(e.target).css("cursor","");
			makeWFPreview();
        });
		
		function zoomPZ(v){
			var matrix = pz.panzoom('getMatrix');
			matrix[0] = v;
			matrix[3] = v;
			pz.panzoom("setMatrix", matrix);
		}
		function panPZ(v){
			var matrix = pz.panzoom('getMatrix');
			panStep = 40*wfZoom;
			matrix[4] = parseInt(matrix[4]) + v.left*panStep;
			matrix[5] = parseInt(matrix[5]) + v.top*panStep;
			pz.panzoom('option', 'disablePan', false);
            pz.panzoom("pan", matrix[4], matrix[5], { animate: true});
			pz.panzoom('option', 'disablePan', true);
			//pz.panzoom("setMatrix", matrix);
		}
		var tao_PanCanvas = window.doWFPan = function(direction){
			panDirection = {top:0, left:0}
			if(direction == "pan-left"){
				panDirection.left = -1;
			}
			if(direction == "pan-right"){
				panDirection.left = 1;
			}
			if(direction == "pan-up"){
				panDirection.top = -1;
			}
			if(direction == "pan-down"){
				panDirection.top = 1;
			}
			panPZ(panDirection);
			makeWFPreview();
		};
		var tao_ZoomCanvas = window.doWFZoom = function(zoom){
			if(zoom == "zoom-plus"){
				wfZoom += 0.1;
				if(wfZoom > maxScale) {wfZoom = maxScale;};
			}
			if(zoom == "zoom-1to1"){
				wfZoom = 1;
			}
			if(zoom == "zoom-minus"){
				wfZoom -= 0.1;
				if(wfZoom < minScale) {wfZoom = minScale;};
			}
			zoomPZ(wfZoom);
			jsp.setZoom(wfZoom);
			$elZoom.html( parseInt(wfZoom*100) + "%");
			makeWFPreview();
		};
		

		$("#preview-toolbar").on("click", ".preview-toolbar-action", function(){
			var action = $(this).data("action");
			if(action == "empty-wf") {
				if(toolboxModules.selected.length==0){
					//todo: alert for delete all
					$(".w", $elCanvas).addClass("selected");
					toolboxModules.rescanSelected();
				}
				toolboxModules.rmSelected();
			};
			if( (action == "zoom-plus") || (action == "zoom-minus") || (action == "zoom-1to1") ){
				tao_ZoomCanvas(action);
			};
			if(action == "zoom-fitall"){
				alert("fit");
				tao_ZoomFitAllNodes();
			}
			
		});
		$("#control-toolbar").on("click", ".toolbar-action", function(){
			var action = $(this).data("action");
			if(action == "home"){
				console.log("message");
				window.parent.tao_closeWorkflow();
			}
		});

		$("#preview-zoom-toolbar").on("click", ".preview-toolbar-action", function(){
			var action = $(this).data("action");
			if( (action == "pan-left") || (action == "pan-right") || (action == "pan-up") || (action == "pan-down") ){
				tao_PanCanvas(action);
			}
		});
////////////////////////////////////

    // setup some defaults for jsPlumb.
    var instance = window.jsp = jsPlumb.getInstance({
        Endpoint: ["Dot", {radius: 2}],
        //Connector:"StateMachine",
		Connector:[ "Flowchart", { stub: [20, 20], gap: 5, cornerRadius: 150, alwaysRespectStubs: true } ],
        HoverPaintStyle: {stroke: "#1e8151", strokeWidth: 2 },
        ConnectionOverlays: [
            [ "Arrow", {
                location: 1,
                id: "arrow",
                length: 10,
                foldback: 0.8
            } ],
            [ "Label", { label: "FOO", id: "label", cssClass: "aLabel" }]
        ],
        Container: "canvas"
    });
	
	window.jsp.bind("groupDragStop", function(params) {
    	makeWFPreview();
    });
	$( window )
	.on( "resize", function() {
		makeWFPreview();
	});
	

console.log("create connector style");
	if (window.prefferences.workFlowConnectors == "S"){
		instance.registerConnectionType("basic", { 	anchor:"Continuous",
												connector:[ "StateMachine", { stub: [20, 20], gap: 5, cornerRadius: 5, midpoint: 0.5, alwaysRespectStubs: true } ],
											}
									);
	};
	if (window.prefferences.workFlowConnectors == "F"){
		instance.registerConnectionType("basic", { 	anchor:"Continuous",
												connector:[ "Flowchart", { stub: [20, 20], gap: 5, cornerRadius: 5, midpoint: 0.5, alwaysRespectStubs: true } ],
											}
									);
	};


    var canvas = document.getElementById("canvas");
    var windows = jsPlumb.getSelector("#canvas .w");

    // bind a click listener to each connection; the connection is deleted. you could of course
    // just do this: jsPlumb.bind("click", jsPlumb.detach), but I wanted to make it clear what was
    // happening.
    instance.bind("click", function (c) {
        instance.deleteConnection(c);
    });

    // bind a connection listener. note that the parameter passed to this function contains more than
    // just the new connection - see the documentation for a full list of what is included in 'info'.
    // this listener sets the connection's internal
    // id as the label overlay's text.
    instance.bind("connection", function (info) {
        info.connection.getOverlay("label").setLabel(info.connection.id);
    });
	
	instance.bind("beforeDrag", function(params) { //before connection drag
									console.log("before drag binded event");
									return true;
								});
	instance.bind("beforeDrop", function(params) { //before connection drag
									console.log("before drop binded event");
									return true;
								});
	instance.bind("connection", function(info) {
									console.log("waw connection binded event, update model ...");
									return true;
								});

    // bind a double click listener to "canvas"; add new node when this occurs.
    jsPlumb.on(canvas, "dblclick", function(e) {
        console.log("canvas , dblclick");
    });
	
	var delNode = function(el){
        jsp.deleteConnectionsForElement(el);
        jsp.removeAllEndpoints(el);
        jsp.remove(el);
		
	}
	window.npDelNode = delNode;
	
    // initialise element as connection targets and source.
    var initNode = function(el) {

        // initialise draggable elements.
        instance.draggable(el);

        instance.makeSource(el, {
            filter: ".ep",
            anchor: "Continuous",
            connectorStyle: { stroke: "#5c96bc", strokeWidth: 2, outlineStroke: "transparent", outlineWidth: 4 },
            connectionType:"basic",
            extract:{
                "action":"the-action"
            },
            maxConnections: 20,
            onMaxConnections: function (info, e) {
                alert("Maximum connections (" + info.maxConnections + ") reached");
            }
        });

        instance.makeTarget(el, {
            dropOptions: { hoverClass: "dragHover" },
            anchor: "Continuous",
            allowLoopback: true
        });

        // this is not part of the core demo functionality; it is a means for the Toolkit edition's wrapped version of this demo to find out about new nodes being added.
        instance.fire("jsPlumbDemoNodeAdded", el);
    };

    newNode = function(x, y, dna) {
        var d = document.createElement("div");
        var id = jsPlumbUtil.uuid();
		var completeness = Math.floor(Math.random() * (100 - 0)) + 0; //implies percent by default
		var innerHTML ="";
		innerHTML += "<div class=\"module-info\">";
		innerHTML += "<div class=\"module-animation\">";
		innerHTML += "<svg id=\"development_icon\" x=\"0px\" y=\"0px\" width=\"32px\" height=\"32px\"><path id=\"large-cog\" d=\"m13.331,1c-1.152,0.296 -2.248,0.712 -3.285,1.126c0.865,4.027 -2.535,5.329 -4.955,3.612c-0.922,0.652 -1.614,1.541 -1.902,2.785c2.535,1.716 1.268,6.275 -2.189,5.861c0,1.303 0,2.604 0,3.91c3.688,-0.357 4.494,4.204 2.189,6.157c0.635,0.947 0.922,2.252 2.189,2.547c2.189,-1.835 5.531,-0.178 4.667,3.613c1.038,0.414 2.132,0.83 3.284,1.124c0.463,-3.198 5.244,-3.198 5.763,0c1.153,-0.294 2.247,-0.71 3.286,-1.124c-0.864,-4.027 2.533,-5.332 4.955,-3.613c0.922,-0.65 1.61,-1.541 1.9,-2.784c-2.535,-1.716 -1.267,-6.275 2.19,-5.862c0,-1.302 0,-2.605 0,-3.908c-3.687,0.298 -4.495,-4.203 -2.19,-6.159c-0.635,-0.948 -0.865,-2.251 -2.189,-2.487c-2.191,1.836 -5.53,0.178 -4.666,-3.614c-1.039,-0.413 -2.133,-0.829 -3.286,-1.124c-0.806,3.256 -4.954,3.256 -5.761,-0.06zm8.586,15.398c0,3.196 -2.536,5.804 -5.705,5.804c-3.17,0 -5.705,-2.607 -5.705,-5.804c0,-3.197 2.535,-5.805 5.705,-5.805c3.17,-0.057 5.705,2.548 5.705,5.805z\" fill=\"#5c96bc\"/></svg>";
		innerHTML += "</div>";
		innerHTML += "<div class=\"module-new\"></div>";
		//innerHTML += "<div class=\"module-title\">"+"Module:&nbsp;" + id.substring(0, 7)+"</div>";
		innerHTML += "<div class=\"module-title\">"+dna.mlabel+"</div>";
		innerHTML += "<div class=\"module-subtitle\">Mar 26, 2017 11:44 PM</div>";
		innerHTML += "<div class=\"module-status\">"+completeness+"% Completed</div>";
		innerHTML += "</div>";
		innerHTML += "<div class=\"ep\"></div>";
		innerHTML += "<div class=\"module-middle\" title=\"RES\"><div class=\"module-icon csvType\">";
		innerHTML += "<svg width=\"40\" height=\"40\">";
		innerHTML += "<path id=\"arc1\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"12\" d=\""+describeArc(20, 20, 12, 0, completeness/100*360)+"\" />";
		innerHTML += "</svg>";
		innerHTML += "</div></div>";
		innerHTML += "<footer class=\"module-footer\">";
		innerHTML += "<div class=\"meta\"><button class=\"btn-transparent btn-action-erasemodule\"><i class=\"fa fa-trash\"></i><span class=\"sr-only\">Erase module</span></button></div>";
		innerHTML += "<div class=\"meta\"><button class=\"btn-transparent btn-action-editmodule\"><i class=\"fa fa-pencil\"></i><span class=\"sr-only\">Edit module</span></button></div>";
//		innerHTML += "<div class=\"meta\"><i class=\"fa fa-clock-o\"></i>&nbsp;720 ore</div>";
		innerHTML += "</footer>";
        d.className = "w";
        d.id = id;
		d.innerHTML = innerHTML;
        d.style.left = x + "px";
        d.style.top = y + "px";
		var	oneNodeData = {
					"type":"stdBlock",
					"blockid":id,
					"draggable":true,
					"resizable":true,
					"payload":{
						"mtype":dna.mtype,
						"mlabel":dna.mlabel
					}
			};
		d.dataset.dna = JSON.stringify(oneNodeData); //Having to access dataset
		d.style.opacity = 0;
		d.onmousedown = function(){
							tao_adModuleToSelection(id);
						};
        instance.getContainer().appendChild(d);
		$("#"+id).fadeTo( "slow" , .8, function() {});
        initNode(d);
		toolboxModules.newModule(oneNodeData);
        return d;
    };
	window.npNewNode = newNode;
    // suspend drawing and initialise.
    instance.batch(function () {
        for (var i = 0; i < windows.length; i++) {
            initNode(windows[i], true);
        }
        // and finally, make a few connections
        instance.connect({ source: "opened", target: "phone1", type:"basic" });
        instance.connect({ source: "phone1", target: "phone1", type:"basic" });
        instance.connect({ source: "phone1", target: "inperson", type:"basic" });
        instance.connect({ source:"phone2", target:"rejected", type:"basic" });
    });
    console.log("jsPlumb ready end");

	jsPlumb.setContainer("canvas");
	jsPlumb.fire("jsPlumbDemoLoaded", instance);
	
var tmp_d = newNode(584,42,{"mtype":"ds-SciHubSentinel-2","mlabel":"SciHub Sentinel-2"});
var tmp_m1 = newNode(391,295,{"mtype":"otb-BandMath","mlabel":"Band Math"});
var tmp_m2 = newNode(780,297,{"mtype":"otb-BandMath","mlabel":"Band Math"});
var tmp_mc = newNode(562,547,{"mtype":"otb-ConcatenateImages","mlabel":"Images Concatenation"});

instance.connect({ source:$(tmp_d).attr("id"), target:$(tmp_m1).attr("id"), type:"basic" });
instance.connect({ source:$(tmp_d).attr("id"), target:$(tmp_m2).attr("id"), type:"basic" });
instance.connect({ source:$(tmp_m1).attr("id"), target:$(tmp_mc).attr("id"), type:"basic" });
instance.connect({ source:$(tmp_m2).attr("id"), target:$(tmp_mc).attr("id"), type:"basic" });

});


//
updateModuleStatus = function(id, updateData){
	var el = $("#"+id);
	if( updateData && updateData.progress && (parseFloat(updateData.progress) == updateData.progress) ){
			$(el).find(".module-status").html(updateData.progress+"% completed");
	}
	if( updateData && updateData.state ){
			$(el).find(".module-status").html(updateData.progress+"% completed");
	}
	//$( document ).trigger( "module:updatestatus");
}
updateModuleStatus("", {"state":"completed", "progress":68});
//updateModuleStatus("5dbb0b93-2a2a-4baf-9780-c9c9510be4e1",{"state":"completed", "progress":5})


	$elCanvas
	.on( "click",".btn-action-erasemodule", function(e) { //erase module on trash icon click
		e.stopPropagation();
		var id = $(this).closest(".w").attr("id");
		$(this).closest(".w").addClass("selected");
		toolboxModules.rescanSelected();
		toolboxModules.rmSelected();
		console.log(id);
	})
	.on( "click", function(e) {
		//check if own event is propagated and do nothing
		if(e.target != this){
			return;
		}
		$(".w", $elCanvas).removeClass("selected");
		toolboxModules.rescanSelected();
		console.log(e);
		console.log("click on canvas > unselect all");
	}).on("mousedown",".w", function(e) {
		var id = $(this).attr("id");
		console.log("mouse down"+id);
	});

var tao_adModuleToSelection = function(id){
	if( $.inArray( id, toolboxModules.selected ) != -1 ){
		return; //check if tao module already in current selection and then do nothing
	}
	
	if(!keyboardShifted){ //if keyboard is shifted keep current selection else unselect al modules on workspace
		$(".w",$elCanvas).removeClass("selected");
	} 
	$("#"+id).addClass("selected");
	toolboxModules.rescanSelected();
	console.log("mousedown on "+id);
}



