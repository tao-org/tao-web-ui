var wf_removeNode;
var wfZoom = 1;
var minScale = 0.1;
var maxScale = 10;
var incScale = 0.1;
var keyboardShifted = false;
var wfTools={};

var tao_resetShadowData = function(){
    wfTools={
        components:[],
        datasources:[],
        queries:[],
        sensors:[],
        dockers:[],
        toolboxnodes:{
            uds:{},
            ds:{},
            pc:{},
            q:{},
            d:{}
        }
    };
};
//start with clean data
tao_resetShadowData();


//used elements
var $elCanvas = $("#canvas");
var $elZoom = $(".zoom-percent span", "#preview-toolbar");
var currentWfID = jsGetUrlQueryValue("_wf");

var toolboxModules = {
    firstSelectedId: 0,
	selected: [],
    count: 0,
    leftAlignSelected: function () {
        if (toolboxModules.selected.length < 2) { return; }
        jsp.clearDragSelection();

        //align with first selected
        var minX = wfPlumbCanvasData.nodes[toolboxModules.firstSelectedId].xCoord;
        //$(".w.selected", $elCanvas).each(function () {
        //    var canvasID = $(this).attr('id');

        //    if (wfPlumbCanvasData.nodes[canvasID].xCoord < minX) {
        //        minX = wfPlumbCanvasData.nodes[canvasID].xCoord;
        //    }
        //});

        var lcl_postdata = {};
        var groups = [];
        $(".w.selected", $elCanvas).each(function () {
            var canvasID = $(this).attr('id');
            var nodeId = wfPlumbCanvasData.nodesMap[canvasID];
            if (wfPlumbCanvasData.nodes[canvasID]) {
                wfPlumbCanvasData.nodes[canvasID].xCoord = minX;
                lcl_postdata[nodeId] = [minX, wfPlumbCanvasData.nodes[canvasID].yCoord];
            }
            var groupID = $(this).data("group");
            if (groupID && $.inArray(groupID, groups)) {
                canvasRenderer.fitGroup(groupID);
                groups.push(groupID);
            }
            $(this).css('left', minX);
        });
        
        $.when(postNodesPosition(currentWfID, lcl_postdata))
            .done(function (putOneComponentResponse) {
                $(".v-lastaction", "#infoband").html("elements left aligned");
                $(".w", $elCanvas).removeClass("selected");
                toolboxModules.rescanSelected();
                window.jsp.repaintEverything();
                makeWFPreview();
            })
            .fail(function (jqXHR) {
                chkXHR(jqXHR.status);
                alert("Could not update position", "ERROR");
            });   
    },
    rightAlignSelected: function () {
        if (toolboxModules.selected.length < 2) { return; }
        jsp.clearDragSelection();

        //align with first selected
        var maxX = wfPlumbCanvasData.nodes[toolboxModules.firstSelectedId].xCoord + $("#" + toolboxModules.firstSelectedId).width();
        //var maxX = Number.MIN_VALUE;
        //$(".w.selected", $elCanvas).each(function () {
        //    var canvasID = $(this).attr('id');

        //    var rightX = wfPlumbCanvasData.nodes[canvasID].xCoord + $(this).width();
        //    if (rightX > maxX) {
        //        maxX = rightX;
        //    }
        //});

        var lcl_postdata = {};
        var groups = [];
        $(".w.selected", $elCanvas).each(function () {
            var canvasID = $(this).attr('id');
            var nodeId = wfPlumbCanvasData.nodesMap[canvasID];
            var nodeX = maxX - $(this).width();
            if (wfPlumbCanvasData.nodes[canvasID]) {
                wfPlumbCanvasData.nodes[canvasID].xCoord = nodeX;
                lcl_postdata[nodeId] = [nodeX, wfPlumbCanvasData.nodes[canvasID].yCoord];
            }
            var groupID = $(this).data("group");
            if (groupID && $.inArray(groupID, groups)) {
                canvasRenderer.fitGroup(groupID);
                groups.push(groupID);
            }
            $(this).css('left', nodeX);
        });

        $.when(postNodesPosition(currentWfID, lcl_postdata))
            .done(function (putOneComponentResponse) {
                $(".v-lastaction", "#infoband").html("elements right aligned");
                $(".w", $elCanvas).removeClass("selected");
                toolboxModules.rescanSelected();
                window.jsp.repaintEverything();
                makeWFPreview();
            })
            .fail(function (jqXHR) {
                chkXHR(jqXHR.status);
                alert("Could not update position", "ERROR");
            });
    },
    topAlignSelected: function () {
        if (toolboxModules.selected.length < 2) { return; }
        jsp.clearDragSelection();

        //align with first selected
        var minY = wfPlumbCanvasData.nodes[toolboxModules.firstSelectedId].yCoord;
        //var minY = Number.MAX_VALUE;
        //$(".w.selected", $elCanvas).each(function () {
        //    var canvasID = $(this).attr('id');

        //    if (wfPlumbCanvasData.nodes[canvasID].yCoord < minY) {
        //        minY = wfPlumbCanvasData.nodes[canvasID].yCoord;
        //    }
        //});

        var lcl_postdata = {};
        var groups = [];
        $(".w.selected", $elCanvas).each(function () {
            var canvasID = $(this).attr('id');
            var nodeId = wfPlumbCanvasData.nodesMap[canvasID];
            if (wfPlumbCanvasData.nodes[canvasID]) {
                wfPlumbCanvasData.nodes[canvasID].yCoord = minY;
                lcl_postdata[nodeId] = [wfPlumbCanvasData.nodes[canvasID].xCoord, minY];
            }
            var groupID = $(this).data("group");
            if (groupID && $.inArray(groupID, groups)) {
                canvasRenderer.fitGroup(groupID);
                groups.push(groupID);
            }
            $(this).css('top', minY);
        });

        $.when(postNodesPosition(currentWfID, lcl_postdata))
            .done(function (putOneComponentResponse) {
                $(".v-lastaction", "#infoband").html("elements top aligned");
                $(".w", $elCanvas).removeClass("selected");
                toolboxModules.rescanSelected();
                window.jsp.repaintEverything();
                makeWFPreview();
            })
            .fail(function (jqXHR) {
                chkXHR(jqXHR.status);
                alert("Could not update position", "ERROR");
            });
    },
    bottomAlignSelected: function () {
        if (toolboxModules.selected.length < 2) { return; }
        jsp.clearDragSelection();

        //align with first selected
        var maxY = wfPlumbCanvasData.nodes[toolboxModules.firstSelectedId].yCoord + $("#" + toolboxModules.firstSelectedId).height();
        //var maxY = Number.MIN_VALUE;
        //$(".w.selected", $elCanvas).each(function () {
        //    var canvasID = $(this).attr('id');

        //    var bottomY = wfPlumbCanvasData.nodes[canvasID].yCoord + $(this).height();
        //    if (bottomY > maxY) {
        //        maxY = bottomY;
        //    }
        //});

        var lcl_postdata = {};
        var groups = [];
        $(".w.selected", $elCanvas).each(function () {
            var canvasID = $(this).attr('id');
            var nodeId = wfPlumbCanvasData.nodesMap[canvasID];
            var nodeY = maxY - $(this).height();
            if (wfPlumbCanvasData.nodes[canvasID]) {
                wfPlumbCanvasData.nodes[canvasID].yCoord = nodeY;
                lcl_postdata[nodeId] = [wfPlumbCanvasData.nodes[canvasID].xCoord, nodeY];
            }
            var groupID = $(this).data("group");
            if (groupID && $.inArray(groupID, groups)) {
                canvasRenderer.fitGroup(groupID);
                groups.push(groupID);
            }
            $(this).css('top', nodeY);
        });

        $.when(postNodesPosition(currentWfID, lcl_postdata))
            .done(function (putOneComponentResponse) {
                $(".v-lastaction", "#infoband").html("elements bottom aligned");
                $(".w", $elCanvas).removeClass("selected");
                toolboxModules.rescanSelected();
                window.jsp.repaintEverything();
                makeWFPreview();
            })
            .fail(function (jqXHR) {
                chkXHR(jqXHR.status);
                alert("Could not update position", "ERROR");
            });
    },
	rmSelected: function(){
		if(toolboxModules.selected.length === 0) {return;}
		jsp.clearDragSelection();
		//highlight nodes to be deleted
        $(".w.selected").addClass("node-to-be-deleted");
        $('#confirm-dialog').modal('confirm',{
            msg:"Are you sure you want to delete selected nodes?",
            callbackConfirm: function() {
                $.each(toolboxModules.selected, function(index, item) {
                    wf_removeNode(item);
                    $("#mti_" + item).remove();
                });
                toolboxModules.selected = [];
                $(".w").removeClass("node-to-be-deleted");
                makeWFPreview();
            },
            callbackCancel:function(){
                toolboxModules.selected = [];
                $(".w").removeClass("node-to-be-deleted");
                makeWFPreview();
            }
        });
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
		if(toolboxModules.selected.length === 1){
			//to do
            //VPA hide align buttons
            $(".align").addClass("hidden");
		}
		if(toolboxModules.selected.length > 1){
            //to do
            //VPA show align buttons
            $(".align").removeClass("hidden");
		}
		if(toolboxModules.selected.length === 0){
            //to do
            //VPA hide align buttons
            $(".align").addClass("hidden");
		}
		makeWFPreview();
	},
	rescanBuild: function(){
		toolboxModules.selected = [];
		$("#selectable").empty();
		$(".w").each(function() {
                    var dna = $(this).attr('dna');
					var id = $(this).attr('id');
					if(dna === undefined){ //if wrongly defined corect module dna data
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
};

jsPlumb.bind("jsPlumbSetZoom", function(z) {
    console.log("zoom changed"+z);
    jsp.setZoom(z);
    $elZoom.html( parseInt(z*100) + "%");
    wf_updateWorkflowById(null,null,z);
});

jsPlumb.bind("jsPlumbNodeAdded", function() {
    console.log("new node added");
});

jsPlumb.bind("jsPlumbPortAdded", function() {
    console.log("new port added");
});

jsPlumb.bind("jsPlumbLoaded", function(instance) {
    //show toolbox
	$.when(getConfigEnums()).done(function (getConfigEnumsResponse) {
		wfTools.taoEnums = getConfigEnumsResponse['data'];
		toolboxSidebar.init();
	});
});
jsPlumb.bind("tao_showConnMenu", function(params) {
    alert("menu");
    console.log(params);
});
jsPlumb.bind("tao_updateNodePosition", function(params) {
    var lcl_postdata = {};
    var groups = [];
    $(".w.selected", $elCanvas).each(function(){
        var canvasID = $(this).attr('id');
        var nodeId =  wfPlumbCanvasData.nodesMap[canvasID];
        var top = this.offsetTop;
        var left = this.offsetLeft;
        if(wfPlumbCanvasData.nodes[canvasID]){
            var snapResult = jsPlumb.snapToGrid($(this), 0, 0);// 2022.04 VPA: (0,0) => map on closest grid intersection
            top = snapResult[0][1][1];
            left = snapResult[0][1][0];
            wfPlumbCanvasData.nodes[canvasID].xCoord = left;
            wfPlumbCanvasData.nodes[canvasID].yCoord = top;
        }
        lcl_postdata[nodeId] = [left,top];
        var groupID = $(this).data("group");
        if(groupID && $.inArray( groupID, groups )){
            canvasRenderer.fitGroup(groupID);
            groups.push(groupID);
        }
    });
    makeWFPreview();
    $.when(postNodesPosition(currentWfID,lcl_postdata))
        .done(function (putOneComponentResponse) {
            $(".v-lastaction","#infoband").html("position updated");
        })
        .fail(function(jqXHR){
			chkXHR(jqXHR.status);
            alert("Could not update position", "ERROR");
        });
});

jsPlumb.bind("tao_dropNewNode", function(params) {
    console.log("plumb:tao_dropNewNode");
    var lcl_postdata = params[0].fullData;
    $.when(postOneComponent(currentWfID,lcl_postdata))
        .done(function (putOneComponentResponse) {
            if(putOneComponentResponse.status === "SUCCEEDED"){
                var r = chkTSRF(putOneComponentResponse);
                var ntype = "unknown";
                if(r.componentType === "DATASOURCE"){
                    ntype = "ds";
                }
                if(r.componentType === "PROCESSING"){
                    ntype = "pc";
                }
                if(r.componentType === "SCRIPT"){
                    ntype = "sc";
                }
                var nodeData = {
                    "ntype":ntype,
                    "ntemplateid": r.componentId,
                    "mtype": r.componentId,
                    "mlabel": r.name,
                    "fullData": r
                };
                addNewNode(r.xCoord,r.yCoord,nodeData);
                makeWFPreview();

                $(".v-lastaction","#infoband").html("node "+r.name+" added");
            }else{
                alert("Could not add node", "ERROR");
            }
        })
        .fail(function(jqXHR){
			chkXHR(jqXHR.status);
            alert("Could not add node", "ERROR");
        });
});

jsPlumb.bind("tao_loadWorkflowById", function() {
    tao_resetShadowData();
    tao_resetCanvasData();
    retriveSorters();
	
    //unusual serialization of requests to config/sorters and config/groupers, unknown issue with async calls to config endpoint
    function retriveSorters(){
        $.when(getConfigSorters(), getConfigFilters()).then( function(rSorters, rFilters){
            wfTools.configSorters = rSorters[0]['data'];
            wfTools.configFilters = rFilters[0]['data'];
            //retriveGroupers();
            retriveToolboxData();
        }).fail(function(jqXHR){
			chkXHR(jqXHR.status);
            alert("Could not retrive workspace environment data. Unable to proceed. Try again. (config/sorters)");
        });
    }
    function retriveToolboxData() {
        $.when(
            getAllComponents(),
            getAllQueries(),
            getAllDatasources(),
            getAllUserDatasources(),
            getAllSensors(),
            getAllDockers(),
            /*getConfigEnums(),*/
            getConfigGroupers()
        ).done(function (getAllComponentsResponse, getAllQueriesResponse, getAllDatasourcesResponse, getAllUserDatasourcesResponse, getAllSensorsResponse, getAllDockersResponse, /*getConfigEnumsResponse,*/ getConfigGroupersResponse) {
			console.log("Workspace components init start.");
			wfTools.components = getAllComponentsResponse[0]['data'];
			wfTools.queries = getAllQueriesResponse[0]['data'];
			//wfTools.datasources = getAllDatasourcesResponse[0]['data'];
			wfTools.udatasources = getAllUserDatasourcesResponse[0]['data'];
			wfTools.sensors = getAllSensorsResponse[0]['data'];
			wfTools.dockers = getAllDockersResponse[0]['data'];
			//wfTools.taoEnums = getConfigEnumsResponse[0]['data'];
			wfTools.configGroupers = getConfigGroupersResponse[0]['data'];

			//parse components, try to detect orphan and collapsing data, recreate local IDs
			$.each(wfTools.components, function (i, item) {
				var hash = "tboid" + jsHashCode(item.id);
				if (wfTools.toolboxnodes.pc[hash]) {
					alert("Processing module collision. Duplicate id detected");
				} else {
					wfTools.toolboxnodes.pc[hash] = {
						id: hash,
						type: "component",
						label: item.label,
						dna: item
					};
				}
			});
			$.each(wfTools.queries, function (i, item) {
				var hash = "tboid" + jsHashCode(item.sensor + "-" + item.dataSourceName);
				if (wfTools.toolboxnodes.q[hash]) {
					alert("Query collision. Duplicate id detected");
				} else {
					wfTools.toolboxnodes.q[hash] = {
						id: hash,
						type: "query",
						label: item.sensor + "-" + item.dataSourceName,
						dna: item
					};
					$.each(item.parameters, function (index, param) {
						if (wfTools.taoEnums[param.type] && param.valueSet === null) {
							param.valueSet = $.map(wfTools.taoEnums[param.type], function (elm, idx) {
								return elm.value;
							});
						}
					});
				}
			});
			// data source component category is removed from toolbox (is linked with workspace.js wfTools.toolboxnodes.ds commented zones)
			/*$.each(wfTools.datasources, function (i, item) {
				var hash = "tboid" + jsHashCode(item.id);
				if (wfTools.toolboxnodes.ds[hash]) {
					alert("Datasource collision. Duplicate id detected");
				} else {
					wfTools.toolboxnodes.ds[hash] = {
						id: hash,
						type: "datasource",
						label: item.label,
						dna: item
					};
				}
			});*/
			//user datasources
			$.each(wfTools.udatasources, function (i, item) {
				var hash = "tboid" + jsHashCode(item.id);
				if (wfTools.toolboxnodes.uds[hash]) {
					alert("Datasource collision. Duplicate id detected");
				} else {
					wfTools.toolboxnodes.uds[hash] = {
						id: hash,
						type: "udatasource",
						label: item.label,
						dna: item
					};
				}
			});

			wf_renderComponentsToolBox();
			wf_populateSortersAndGroupers();
			console.log("Workspace components toolbox init done.");
			$.when(wf_loadWorkflowById(currentWfID)).done(function(){
				toolboxSidebar.refresh();
				contentLoading("hide");
			});
		}).fail(function (jqXHR) {
			contentLoading("hide");
			chkXHR(jqXHR.status);
			alert("Could not retrive workspace data. Unable to proceed");
		});
    }
});

/************************************************jsplumb******************************************/
jsPlumb.ready(function () {
	contentLoading("show");
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
          //  if (e.ctrlKey || e.originalEvent.ctrlKey) {
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
                jsPlumb.fire("jsPlumbSetZoom", wfZoom);
				makeWFPreview();
         //   }
        })
        .on("mousedown touchstart", function(e) {
            if (e.which !== 1) return;
            if ($(e.target).closest(".group-container").length > 0 ||
                $(e.target).hasClass("panzoom-button")) return;

            // Start canvas pan / select
            if (e.ctrlKey && e.which === 1) {
                window.selectStart = { x: e.pageX, y: e.pageY };
            } else if (e.which === 1) {
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
            if (e.target.id === pz[0].id) {
                if (window.panStart) {
                    var deltaX = window.panStart.x - e.pageX;
                    var deltaY = window.panStart.y - e.pageY;
                    if (deltaX === 0 && deltaY === 0) {
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
            var matrix = pz.panzoom('getMatrix');
            wf_updateWorkflowById(matrix[4],matrix[5],null);
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
            wf_updateWorkflowById(matrix[4],matrix[5],null);
        }
        
		var tao_PanCanvas = window.doWFPan = function(direction){
			panDirection = {top:0, left:0};
			if(direction === "pan-left"){
				panDirection.left = -1;
			}
			if(direction === "pan-right"){
				panDirection.left = 1;
			}
			if(direction === "pan-up"){
				panDirection.top = -1;
			}
			if(direction === "pan-down"){
				panDirection.top = 1;
			}
			panPZ(panDirection);
			makeWFPreview();
        };
        
		var tao_ZoomCanvas = window.doWFZoom = function(zoom){
			if(zoom === "zoom-plus"){
				wfZoom += 0.1;
				if(wfZoom > maxScale) {wfZoom = maxScale;}
			}
			if(zoom === "zoom-1to1"){
				wfZoom = 1;
			}
			if(zoom === "zoom-minus"){
				wfZoom -= 0.1;
				if(wfZoom < minScale) {wfZoom = minScale;}
			}
			zoomPZ(wfZoom);
            jsPlumb.fire("jsPlumbSetZoom", wfZoom);
			makeWFPreview();
        };

		$("#preview-toolbar").on("click", ".preview-toolbar-action", function(){
			var action = $(this).data("action");
			if(action === "empty-wf") {
				if(toolboxModules.selected.length === 0){
					//todo: alert for delete all
					$(".w", $elCanvas).addClass("selected");
					toolboxModules.rescanSelected();
				}
				toolboxModules.rmSelected();
			}
			if( (action === "zoom-plus") || (action === "zoom-minus") || (action === "zoom-1to1") ){
				tao_ZoomCanvas(action);
			}
			if(action === "zoom-fitall"){
				tao_ZoomFitAllNodes();
			}
			
        });
        
		$("#control-toolbar").on("click", ".toolbar-action", function(){
			var action = $(this).data("action");
			if(action === "back-home"){
				console.log("back-home");
                window.parent.tao_closeWorkflow();
			}
            if(action === "show-info"){
                console.log("show-info");
                toolboxHeader.open();
            }
            if (action === "align-left") {
                console.log("align-left");
                toolboxModules.leftAlignSelected();
            }
            if (action === "align-right") {
                console.log("align-right");
                toolboxModules.rightAlignSelected();
            }
            if (action === "align-top") {
                console.log("align-top");
                toolboxModules.topAlignSelected();
            }
            if (action === "align-bottom") {
                console.log("align-bottom");
                toolboxModules.bottomAlignSelected();
            }
        });

		$("#preview-zoom-toolbar").on("click", ".preview-toolbar-action", function(){
			var action = $(this).data("action");
			if( (action === "pan-left") || (action === "pan-right") || (action === "pan-up") || (action === "pan-down") ){
				tao_PanCanvas(action);
			}
        });
        
        $("#img-wf-preview").on("click", function(e){
          var panX = e.clientX - $(".viewfinder", this).offset().left - $(".viewfinder", this).width()/2;
          var panY = e.clientY - $(".viewfinder", this).offset().top - $(".viewfinder", this).height()/2;

          var zm   = this.offsetWidth/$(".viewfinder", this).outerWidth();

          panDirection = {left:parseInt((-1)*panX*zm/wfZoom/4), top:parseInt((-1)*panY*zm/wfZoom/4)};
          
          panPZ(panDirection);
          makeWFPreview();
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
        Container: "canvas",
        Anchor:"Center"
    });

	$( window )
	.on( "resize", function() {
		makeWFPreview();
	});
	

    console.log("create connector style");
	if (window.prefferences.workFlowConnectors === "S"){
		instance.registerConnectionType("basic", { 	anchor:"Continuous",
												connector:[ "StateMachine", { stub: [20, 20], gap: 5, cornerRadius: 5, midpoint: 0.5, alwaysRespectStubs: true } ],
											}
									);
	}
	if (window.prefferences.workFlowConnectors === "F"){
		instance.registerConnectionType("basic", { 	anchor:"Continuous",
												connector:[ "Flowchart", { stub: [20, 20], gap: 5, cornerRadius: 5, midpoint: 0.5, alwaysRespectStubs: true } ],
											}
									);
	}

    var canvas = document.getElementById("canvas");
    var windows = jsPlumb.getSelector("#canvas .w");

    instance.bind("groupDragStop", function(params) {
        console.log("groupDragStop: "+params.el.id);
        jsPlumb.fire("tao_updateNodePosition", [params.el.id, params.finalPos[0], params.finalPos[1]]);
        makeWFPreview();
    });
    
//<div style="float:left;"><svg width="48" height="50"><g transform="scale(4)"><path fill="#fff" stroke="#3c8dbc" stroke-width=".3" d="M5.9,1.2L0.7,6.5l5.2,5.4l5.2-5.4L5.9,1.2z" /></g><text x="50%" y="50%" text-anchor="middle" fill="#3c8dbc" stroke="#3c8dbc" stroke-width=".5" font-size="20px" font-family="Arial" dy=".4em">G</text></svg><div>
    // bind a click listener to each connection; on click the connection is deleted
    /*instance.bind("click", function(c, e) {
        //console.log(c);
        c.addClass("conn-to-be-deleted");

        //alert("click: delete connection id:" +c.id);
        //jsPlumb.fire("tao_showConnMenu", [c, e]);
        //return;
        $('#confirm-dialog').modal('confirm',{
            msg:"Are you sure you want to delete selected connector?",
            callbackConfirm: function() {
                instance.deleteConnection(c); //this itself will trigger connectionDetached event
                console.log("delete connection id:" +c.id);
            },
            callbackCancel:function(){
                c.removeClass("conn-to-be-deleted");
            }
        });
        //delete wfPlumbCanvasData.connectors[c.id];
    });*/

    // cma:on right click the connection, we can add sorting/grpuping options
    instance.bind("click", function (c, e) {
        e.preventDefault();
		c.addClass("conn-to-be-deleted");
        //find the modal
        var $elModalSG = $("#modalSortAndGroup");

        var $elSelectSortType = $("#selectSortType");
        var $elSelectSortDirection = $("#selectSortDirection");
        var $elselectGroupType = $("#selectGroupType");
        var $elinputGroupingArg = $("#inputGroupingArg");
		var $elSelectFilterType = $("#selectFilterType");
		var $elinputFilteringArg = $("#inputFilteringArg");

        if($("#" + c.id).length == 0) //if div doesn't exists
        {   
            //add only the div with id= connid; (see  $elFrmConnectorEdit.on("submit"), if aggregator added(and <> none) => add the svg image )
            c.setLabel("<div id=\""+c.id+"\" class=\"btnSG\" style=\"float:left;\" data-connid=\""+c.id+"\">\n" +
            //  "<svg width=\"48\" height=\"50\">\n" +
            //  "  <g transform=\"scale(4)\"><path fill=\"#fff\" stroke=\"#3c8dbc\" stroke-width=\".3\" d=\"M5.9,1.2L0.7,6.5l5.2,5.4l5.2-5.4L5.9,1.2z\" /></g>\n" +
            //  "  <g transform=\"scale(0.03) translate(420 600)\"><path fill=\"#3c8dbc\" d=\"M512.1 191l-8.2 14.3c-3 5.3-9.4 7.5-15.1 5.4-11.8-4.4-22.6-10.7-32.1-18.6-4.6-3.8-5.8-10.5-2.8-15.7l8.2-14.3c-6.9-8-12.3-17.3-15.9-27.4h-16.5c-6 0-11.2-4.3-12.2-10.3-2-12-2.1-24.6 0-37.1 1-6 6.2-10.4 12.2-10.4h16.5c3.6-10.1 9-19.4 15.9-27.4l-8.2-14.3c-3-5.2-1.9-11.9 2.8-15.7 9.5-7.9 20.4-14.2 32.1-18.6 5.7-2.1 12.1.1 15.1 5.4l8.2 14.3c10.5-1.9 21.2-1.9 31.7 0L552 6.3c3-5.3 9.4-7.5 15.1-5.4 11.8 4.4 22.6 10.7 32.1 18.6 4.6 3.8 5.8 10.5 2.8 15.7l-8.2 14.3c6.9 8 12.3 17.3 15.9 27.4h16.5c6 0 11.2 4.3 12.2 10.3 2 12 2.1 24.6 0 37.1-1 6-6.2 10.4-12.2 10.4h-16.5c-3.6 10.1-9 19.4-15.9 27.4l8.2 14.3c3 5.2 1.9 11.9-2.8 15.7-9.5 7.9-20.4 14.2-32.1 18.6-5.7 2.1-12.1-.1-15.1-5.4l-8.2-14.3c-10.4 1.9-21.2 1.9-31.7 0zm-10.5-58.8c38.5 29.6 82.4-14.3 52.8-52.8-38.5-29.7-82.4 14.3-52.8 52.8zM386.3 286.1l33.7 16.8c10.1 5.8 14.5 18.1 10.5 29.1-8.9 24.2-26.4 46.4-42.6 65.8-7.4 8.9-20.2 11.1-30.3 5.3l-29.1-16.8c-16 13.7-34.6 24.6-54.9 31.7v33.6c0 11.6-8.3 21.6-19.7 23.6-24.6 4.2-50.4 4.4-75.9 0-11.5-2-20-11.9-20-23.6V418c-20.3-7.2-38.9-18-54.9-31.7L74 403c-10 5.8-22.9 3.6-30.3-5.3-16.2-19.4-33.3-41.6-42.2-65.7-4-10.9.4-23.2 10.5-29.1l33.3-16.8c-3.9-20.9-3.9-42.4 0-63.4L12 205.8c-10.1-5.8-14.6-18.1-10.5-29 8.9-24.2 26-46.4 42.2-65.8 7.4-8.9 20.2-11.1 30.3-5.3l29.1 16.8c16-13.7 34.6-24.6 54.9-31.7V57.1c0-11.5 8.2-21.5 19.6-23.5 24.6-4.2 50.5-4.4 76-.1 11.5 2 20 11.9 20 23.6v33.6c20.3 7.2 38.9 18 54.9 31.7l29.1-16.8c10-5.8 22.9-3.6 30.3 5.3 16.2 19.4 33.2 41.6 42.1 65.8 4 10.9.1 23.2-10 29.1l-33.7 16.8c3.9 21 3.9 42.5 0 63.5zm-117.6 21.1c59.2-77-28.7-164.9-105.7-105.7-59.2 77 28.7 164.9 105.7 105.7zm243.4 182.7l-8.2 14.3c-3 5.3-9.4 7.5-15.1 5.4-11.8-4.4-22.6-10.7-32.1-18.6-4.6-3.8-5.8-10.5-2.8-15.7l8.2-14.3c-6.9-8-12.3-17.3-15.9-27.4h-16.5c-6 0-11.2-4.3-12.2-10.3-2-12-2.1-24.6 0-37.1 1-6 6.2-10.4 12.2-10.4h16.5c3.6-10.1 9-19.4 15.9-27.4l-8.2-14.3c-3-5.2-1.9-11.9 2.8-15.7 9.5-7.9 20.4-14.2 32.1-18.6 5.7-2.1 12.1.1 15.1 5.4l8.2 14.3c10.5-1.9 21.2-1.9 31.7 0l8.2-14.3c3-5.3 9.4-7.5 15.1-5.4 11.8 4.4 22.6 10.7 32.1 18.6 4.6 3.8 5.8 10.5 2.8 15.7l-8.2 14.3c6.9 8 12.3 17.3 15.9 27.4h16.5c6 0 11.2 4.3 12.2 10.3 2 12 2.1 24.6 0 37.1-1 6-6.2 10.4-12.2 10.4h-16.5c-3.6 10.1-9 19.4-15.9 27.4l8.2 14.3c3 5.2 1.9 11.9-2.8 15.7-9.5 7.9-20.4 14.2-32.1 18.6-5.7 2.1-12.1-.1-15.1-5.4l-8.2-14.3c-10.4 1.9-21.2 1.9-31.7 0zM501.6 431c38.5 29.6 82.4-14.3 52.8-52.8-38.5-29.6-82.4 14.3-52.8 52.8z\"/></g>\n" +
            //  "</svg>\n" +
                "<div>");
                
    
            var connid = c.id;
            var connData = wfPlumbCanvasData.getConnectorById(connid);

            $elSelectSortType.val("none").change();
            $elselectGroupType.val("none").change();
			$elSelectFilterType.val("").change();

            if(connData.linkData.aggregator && connData.linkData.aggregator.sorter && connData.linkData.aggregator.sorter[0]){
                $elSelectSortType.val(connData.linkData.aggregator.sorter[0]).trigger("change");
            }

            var sourceNodeId = connData.from.split("_")[1];
            var targetNodeId = connData.to.split("_")[1];
            var sourceNodeData = wfPlumbCanvasData.getNodeById(sourceNodeId);
            var targetNodeData = wfPlumbCanvasData.getNodeById(targetNodeId);
            if (sourceNodeData.componentType == "DATASOURCE" && (targetNodeData.componentType == "DATASOURCE" || targetNodeData.componentType == "PROCESSING")) {
				//grouping is allowed only between two Datasource components
				if (targetNodeData.componentType == "DATASOURCE") {
					$(".grouping", "#modalSortAndGroup").show();

					if (connData.linkData.aggregator && connData.linkData.aggregator.associator && connData.linkData.aggregator.associator[0]) {
						$elselectGroupType.val(connData.linkData.aggregator.associator[0]).trigger("change");
						if (connData.linkData.aggregator.associator[1]) {
							$elinputGroupingArg.val(connData.linkData.aggregator.associator[1]).trigger("change");
						}
					}
				} else {
					$(".grouping", "#modalSortAndGroup").hide();
				}
				//filtering is allowed between Datasource and processing component too
				$(".filtering", "#modalSortAndGroup").show();
				$elinputFilteringArg.val("").trigger("change");
				if (connData.linkData.aggregator && connData.linkData.aggregator.filter && connData.linkData.aggregator.filter[0]) {
					$elSelectFilterType.val(connData.linkData.aggregator.filter[0]).trigger("change");
					if (connData.linkData.aggregator.filter[1]) {
						$elinputFilteringArg.val(connData.linkData.aggregator.filter[1]).trigger("change");
					}
				}
            }
            else {
                $(".grouping", "#modalSortAndGroup").hide();
				$(".filtering", "#modalSortAndGroup").hide();
            }
            
            //show the modal
            $elModalSG.data("connid", c.id).modal("show");
        }

        else{
            var connid = c.id;
            var connData = wfPlumbCanvasData.getConnectorById(connid);

            $elSelectSortType.val("none").change();
            $elselectGroupType.val("none").change();
			$elSelectFilterType.val("").change();
    
            if(connData.linkData.aggregator && connData.linkData.aggregator.sorter && connData.linkData.aggregator.sorter[0]){
                $elSelectSortType.val(connData.linkData.aggregator.sorter[0]).trigger("change");
            }

            var sourceNodeId = connData.from.split("_")[1];
            var targetNodeId = connData.to.split("_")[1];
            var sourceNodeData = wfPlumbCanvasData.getNodeById(sourceNodeId);
            var targetNodeData = wfPlumbCanvasData.getNodeById(targetNodeId);
            if (sourceNodeData.componentType == "DATASOURCE" && (targetNodeData.componentType == "DATASOURCE" || targetNodeData.componentType == "PROCESSING")) {
				//grouping is allowed only between two Datasource components
                if (targetNodeData.componentType == "DATASOURCE") {
					$(".grouping", "#modalSortAndGroup").show();

					if (connData.linkData.aggregator && connData.linkData.aggregator.associator && connData.linkData.aggregator.associator[0]) {
						$elselectGroupType.val(connData.linkData.aggregator.associator[0]).trigger("change");
						if (connData.linkData.aggregator.associator[1]) {
							$elinputGroupingArg.val(connData.linkData.aggregator.associator[1]).trigger("change");
						}
					}
				} else {
					$(".grouping", "#modalSortAndGroup").hide();
				}
				//filtering is allowed between Datasource and processing component too
				$(".filtering", "#modalSortAndGroup").show();
				$elinputFilteringArg.val("").trigger("change");
				if (connData.linkData.aggregator && connData.linkData.aggregator.filter && connData.linkData.aggregator.filter[0]) {
					$elSelectFilterType.val(connData.linkData.aggregator.filter[0]).trigger("change");
					if (connData.linkData.aggregator.filter[1]) {
						$elinputFilteringArg.val(connData.linkData.aggregator.filter[1]).trigger("change");
					}
				}
            }
            else {
                $(".grouping", "#modalSortAndGroup").hide();
				$(".filtering", "#modalSortAndGroup").hide();
            }

            //show the modal
            $elModalSG.data("connid", connid).modal("show");
        }
    });

    instance.bind("connectionDetached", function (info, originalEvent) {
        console.log("connectionDetached: delete connection id:" + info.connection.id);
        var lcl_payload = wfPlumbCanvasData.connectors[info.connection.id].linkData;
        var lcl_to = wfPlumbCanvasData.connectors[info.connection.id].to;
        var lcl_nodeId = parseInt(lcl_to.split("_")[1]);
        //check if link exists or is just a revert connection event.
        //check if parent node exists before calling delete
        if(_.invert(wfPlumbCanvasData.nodesMap)[lcl_nodeId] && typeof lcl_payload !== "undefined"){
            $.when(delOneLink(lcl_nodeId, lcl_payload))
                .done(function (delOneLinkResponse) {
                    var r = chkTSRF(delOneLinkResponse);
                    if((delOneLinkResponse.status === "SUCCEEDED") && (r.id === lcl_nodeId)){
                        delete wfPlumbCanvasData.connectors[info.connection.id];
                        $(".v-lastaction","#infoband").html("link removed");
                        wfPlumbCanvasData.setNode(delOneLinkResponse.data); // cma:update node after deleting link
                    } else {
                        alert("Could not delete link");
                        //to do revert link on canvas
                    }
                })
                .fail(function(jqXHR){
					chkXHR(jqXHR.status);
                    //to do fix revert
                    //alert("Delete link failed. Reload product.");
                });
        }else{
            delete wfPlumbCanvasData.connectors[info.connection.id];
            $(".v-lastaction","#infoband").html("link removed");
        }
    });

    // bind a connection listener. note that the parameter passed to this function contains more than just the new connection
    instance.bind("connection", function (info) {
        info.connection.getOverlay("label").setLabel(info.connection.id);
        var s = info.sourceId.split('_');
        var t = info.targetId.split('_');

        //find connection in workflow based on internal id of the "to" node
        var toID =  _.invert(wfPlumbCanvasData.nodesMap)[t[1]];
        var linkData = (_.find(wfPlumbCanvasData.nodes[toID].incomingLinks, function(item) {
            return (item.sourceNodeId === parseInt(s[1]) && item.output.id === t[2] && item.input.id === s[2]); // new condition added: item.sourceNodeId === parseInt(s[1])
        }));
        //console.log("TO id:"+toID);console.log(linkData);

        //cma: if aggregator exists, add icon
         if (linkData && linkData.aggregator){
           info.connection.setLabel("<div  id=\""+info.connection.id+"\"  class=\"btnSG\" style=\"float:left;\" data-connid=\""+info.connection.id+"\">\n" +
                "<svg width=\"48\" height=\"50\">\n" +
                "  <g transform=\"scale(4)\"><path fill=\"#fff\" stroke=\"#3c8dbc\" stroke-width=\".3\" d=\"M5.9,1.2L0.7,6.5l5.2,5.4l5.2-5.4L5.9,1.2z\" /></g>\n" +
                "  <g transform=\"scale(0.03) translate(420 600)\"><path fill=\"#3c8dbc\" d=\"M512.1 191l-8.2 14.3c-3 5.3-9.4 7.5-15.1 5.4-11.8-4.4-22.6-10.7-32.1-18.6-4.6-3.8-5.8-10.5-2.8-15.7l8.2-14.3c-6.9-8-12.3-17.3-15.9-27.4h-16.5c-6 0-11.2-4.3-12.2-10.3-2-12-2.1-24.6 0-37.1 1-6 6.2-10.4 12.2-10.4h16.5c3.6-10.1 9-19.4 15.9-27.4l-8.2-14.3c-3-5.2-1.9-11.9 2.8-15.7 9.5-7.9 20.4-14.2 32.1-18.6 5.7-2.1 12.1.1 15.1 5.4l8.2 14.3c10.5-1.9 21.2-1.9 31.7 0L552 6.3c3-5.3 9.4-7.5 15.1-5.4 11.8 4.4 22.6 10.7 32.1 18.6 4.6 3.8 5.8 10.5 2.8 15.7l-8.2 14.3c6.9 8 12.3 17.3 15.9 27.4h16.5c6 0 11.2 4.3 12.2 10.3 2 12 2.1 24.6 0 37.1-1 6-6.2 10.4-12.2 10.4h-16.5c-3.6 10.1-9 19.4-15.9 27.4l8.2 14.3c3 5.2 1.9 11.9-2.8 15.7-9.5 7.9-20.4 14.2-32.1 18.6-5.7 2.1-12.1-.1-15.1-5.4l-8.2-14.3c-10.4 1.9-21.2 1.9-31.7 0zm-10.5-58.8c38.5 29.6 82.4-14.3 52.8-52.8-38.5-29.7-82.4 14.3-52.8 52.8zM386.3 286.1l33.7 16.8c10.1 5.8 14.5 18.1 10.5 29.1-8.9 24.2-26.4 46.4-42.6 65.8-7.4 8.9-20.2 11.1-30.3 5.3l-29.1-16.8c-16 13.7-34.6 24.6-54.9 31.7v33.6c0 11.6-8.3 21.6-19.7 23.6-24.6 4.2-50.4 4.4-75.9 0-11.5-2-20-11.9-20-23.6V418c-20.3-7.2-38.9-18-54.9-31.7L74 403c-10 5.8-22.9 3.6-30.3-5.3-16.2-19.4-33.3-41.6-42.2-65.7-4-10.9.4-23.2 10.5-29.1l33.3-16.8c-3.9-20.9-3.9-42.4 0-63.4L12 205.8c-10.1-5.8-14.6-18.1-10.5-29 8.9-24.2 26-46.4 42.2-65.8 7.4-8.9 20.2-11.1 30.3-5.3l29.1 16.8c16-13.7 34.6-24.6 54.9-31.7V57.1c0-11.5 8.2-21.5 19.6-23.5 24.6-4.2 50.5-4.4 76-.1 11.5 2 20 11.9 20 23.6v33.6c20.3 7.2 38.9 18 54.9 31.7l29.1-16.8c10-5.8 22.9-3.6 30.3 5.3 16.2 19.4 33.2 41.6 42.1 65.8 4 10.9.1 23.2-10 29.1l-33.7 16.8c3.9 21 3.9 42.5 0 63.5zm-117.6 21.1c59.2-77-28.7-164.9-105.7-105.7-59.2 77 28.7 164.9 105.7 105.7zm243.4 182.7l-8.2 14.3c-3 5.3-9.4 7.5-15.1 5.4-11.8-4.4-22.6-10.7-32.1-18.6-4.6-3.8-5.8-10.5-2.8-15.7l8.2-14.3c-6.9-8-12.3-17.3-15.9-27.4h-16.5c-6 0-11.2-4.3-12.2-10.3-2-12-2.1-24.6 0-37.1 1-6 6.2-10.4 12.2-10.4h16.5c3.6-10.1 9-19.4 15.9-27.4l-8.2-14.3c-3-5.2-1.9-11.9 2.8-15.7 9.5-7.9 20.4-14.2 32.1-18.6 5.7-2.1 12.1.1 15.1 5.4l8.2 14.3c10.5-1.9 21.2-1.9 31.7 0l8.2-14.3c3-5.3 9.4-7.5 15.1-5.4 11.8 4.4 22.6 10.7 32.1 18.6 4.6 3.8 5.8 10.5 2.8 15.7l-8.2 14.3c6.9 8 12.3 17.3 15.9 27.4h16.5c6 0 11.2 4.3 12.2 10.3 2 12 2.1 24.6 0 37.1-1 6-6.2 10.4-12.2 10.4h-16.5c-3.6 10.1-9 19.4-15.9 27.4l8.2 14.3c3 5.2 1.9 11.9-2.8 15.7-9.5 7.9-20.4 14.2-32.1 18.6-5.7 2.1-12.1-.1-15.1-5.4l-8.2-14.3c-10.4 1.9-21.2 1.9-31.7 0zM501.6 431c38.5 29.6 82.4-14.3 52.8-52.8-38.5-29.6-82.4 14.3-52.8 52.8z\"/></g>\n" +
                "</svg>\n" +
                "<div>");
            }

        //register connection to canvasdata
        wfPlumbCanvasData.connectors[info.connection.id] = ({"from":info.sourceId, "to":info.targetId, "linkData":linkData});

        console.log("waw connection binded event, update model ...");
        if(wfPlumbCanvasData.loaded){
            $.when(putOneConnection(s,t))
                .done(function (putOneConnectionResponse) {
                    var r = chkTSRF(putOneConnectionResponse);
                    if((putOneConnectionResponse.status === "SUCCEEDED") && r.id){
                        $(".v-lastaction","#infoband").html("connection added");
                        var linkData = (_.find(r.incomingLinks, function(item) {
                            return (item.sourceNodeId === parseInt(s[1]) && item.output.id === t[2] && item.input.id === s[2]); /// new condition added: item.sourceNodeId === parseInt(s[1])
                        }));
                        //update node definition
                        wfPlumbCanvasData.setNode(putOneConnectionResponse.data);
                        //register link
                        wfPlumbCanvasData.connectors[info.connection.id] = ({"from":info.sourceId, "to":info.targetId, "linkData":linkData});
                    } else {
                        alert("Incompatiple source and target. Reverting");
						jsp.deleteConnection(info.connection);
                        //delete wfPlumbCanvasData.connectors[info.connection.id];
                    }
                })
                .fail(function(jqXHR){
					chkXHR(jqXHR.status);
                    alert("Could not save connection", "ERROR");
                });
///
        }
        return true;
    });

	
	instance.bind("beforeDrag", function(params) { //before connection drag
									console.log("before drag binded event");
									return true;
								});
	instance.bind("beforeDrop", function(params) { //before connection drag
									console.log("before drop binded event");
									return true;
								});
	instance.bind("afterDrag", function(info) {
        console.log("drag ...");
        return true;
								});

    // bind a double click listener to "canvas"; add new node when this occurs.
    jsPlumb.on(canvas, "dblclick", function(e) {
        console.log("canvas , dblclick");
    });
	var delNode = window.wf_removeNode = function(el){
	    //delete node from server
        console.log("delete node id:"+el);
        $.when(delOneNode(currentWfID, wfPlumbCanvasData.nodes[el]))
            .done(function (delOneNodeResponse) {
                //console.log(delOneNodeResponse);
                if(delOneNodeResponse.status === "SUCCEEDED"){
                    $(".v-lastaction","#infoband").html("node removed");
                    removeOneNodeFromCanvas();
                } else {
                    alert("Could not delete node", "ERROR");
                    return 0;
                }
            })
            .fail(function(jqXHR, status, textStatus){
                alert("Could not delete node", "ERROR");
                return 0;
            });

        //remove node and ports from canvasdata
        var removeOneNodeFromCanvas = function (){
            $( "#"+el+" .n-p-o-wrapp, #"+el+" .n-p-i-wrapp").each(function(){
                delete wfPlumbCanvasData.ports[$(this).attr("id")];
            });

            delete wfPlumbCanvasData.nodes[el];
            delete wfPlumbCanvasData.nodesMap[el];

            jsp.deleteConnectionsForElement(el);
            jsp.removeAllEndpoints(el);
            jsp.remove(el);
        };
	};

    console.log("jsPlumb ready end");
	jsPlumb.setContainer("canvas");
	jsPlumb.fire("jsPlumbLoaded", instance);
    //loadWorkflow;
    jsPlumb.fire("tao_loadWorkflowById");
});


//
updateModuleStatus = function(id, updateData){
	var el = $("#"+id);
	if( updateData && updateData.progress && (parseFloat(updateData.progress) === updateData.progress) ){
			$(el).find(".module-status").html(updateData.progress+"% completed");
	}
	if( updateData && updateData.state ){
			$(el).find(".module-status").html(updateData.progress+"% completed");
	}
	//$( document ).trigger( "module:updatestatus");
};
updateModuleStatus("", {"state":"completed", "progress":68});
//updateModuleStatus("5dbb0b93-2a2a-4baf-9780-c9c9510be4e1",{"state":"completed", "progress":5})


	$elCanvas
	.on( "click",".btn-action-erasemodule", function(e) { //erase module on trash icon click
		e.stopPropagation();
        var id = $(this).closest(".w").attr("id");
        $(this).closest(".w").addClass("selected");
        console.log("sterge modul: "+id);
        toolboxModules.rescanSelected();
        toolboxModules.rmSelected();
	})
    .on( "click",".btn-action-groupmodule", function(e) { //group selected modules
        e.stopPropagation();
        var nodeID = $(this).closest(".w").attr("id");
        console.log("group invocation");
        toolboxModules.rescanSelected();
        if (toolboxModules.selected.length<2){
            alert("You need to select at least 2 components in order to create a group.");
            return;
        }

        $('#confirm-dialog').modal('confirm',{
        msg:"Are you sure you want to group the selected modules?",
            callbackConfirm: function () {

                var groupNodeIds = [];
                $(".w.selected", $elCanvas).each(function () {
                    var canvasID = $(this).attr('id');
                    var nodeId = wfPlumbCanvasData.nodesMap[canvasID];

                    groupNodeIds.push(nodeId);                        
                });

                var groupData = {
                    "workflowId": currentWfID,
                    "groupNodeIds": groupNodeIds
                }

                var groupNodes = $.ajax({
                    cache: false,
                    url: baseRestApiURL + "workflow/group",
                    data: JSON.stringify(groupData),
                    type: 'POST',
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "X-Auth-Token": window.tokenKey
                    }
                });
                $.when(groupNodes)
                    .done(function (groupNodesResponse) {
                        if (groupNodesResponse.status === "SUCCEEDED") {
                            window.parent.tao_showWorkflow(currentWfID);
                        }
                        else {
                            alert("Group creation failed. " + groupNodesResponse.message);
                        }
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        alert("Group creation failed. " + errorThrown);
                    });
        },
        callbackCancel:function(){}
        });
    })
    .on("click", ".btn-action-ungroupmodule", function (e) { //ungroup 
        e.stopPropagation();

        var groupCanvasId = $(this).closest(".w").data("group");
        var groupDna = $("#" + groupCanvasId).data("dna");

        $('#confirm-dialog').modal('confirm', {
            msg: "Are you sure you want to ungroup nodes in this group?",
            callbackConfirm: function () {

                var ungroupNodes = $.ajax({
                    cache: false,
                    url: baseRestApiURL + "workflow/ungroup",
                    data: { "groupId": groupDna.fullData.id },
                    type: 'POST',
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/x-www-form-urlencoded",
                        "X-Auth-Token": window.tokenKey
                    }
                });
                $.when(ungroupNodes)
                    .done(function (ungroupNodesResponse) {
                        if (ungroupNodesResponse.status === "SUCCEEDED") {
                            window.parent.tao_showWorkflow(currentWfID);
                        }
                        else {
                            alert("Ungroup nodes failed. " + ungroupNodesResponse.message);
                        }
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        alert("Ungroup nodes failed. " + errorThrown);
                    });
            },
            callbackCancel: function () { }
        });
    })
    .on( "click",".btn-action-editmodule", function(e) { //erase module on trash icon click
            e.stopPropagation();
            var nodeID = $(this).closest(".w").attr("id");
            $propbar.menu("open", {"nodeid":nodeID});
            console.log("propbar invocation");
    })
	.on( "click", function(e) {
		//check if own event is propagated and do nothing
		if(e.target !== this){
			return;
		}
		$(".w", $elCanvas).removeClass("selected");
		toolboxModules.rescanSelected();
		console.log(e);
		console.log("click on canvas > unselect all");
	}).on("mousedown",".w", function(e) {
		var id = $(this).attr("id");
		console.log("mouse down"+id);
	})
    .on("click",".l-n-p-o", function(e){
        var id = $(this).closest(".n-p-o-wrapp").attr("id");
    })
    .on("click",".l-n-p-i", function(e){
        var id = $(this).closest(".n-p-i-wrapp").attr("id");
    })
	.on("mouseover",".n-p-i-wrapp, .n-p-o-wrapp", function (e){
		if ($(this).hasClass("n-p-i-wrapp")) $(this).find(".l-n-p-i").addClass("show");
		if ($(this).hasClass("n-p-o-wrapp")) $(this).find(".l-n-p-o").addClass("show");
	})
	.on("mouseout",".n-p-i-wrapp, .n-p-o-wrapp", function (e){
		if ($(this).hasClass("n-p-i-wrapp")) $(this).find(".l-n-p-i").removeClass("show");
		if ($(this).hasClass("n-p-o-wrapp")) $(this).find(".l-n-p-o").removeClass("show");
	});

//tooltip
$( document ).uitooltip({
    items: ".l-n-p-i, .l-n-p-o",
    content: function() {
        var element = $( this );
        var id = null;
        var renderPortTP = function(fd){
			var nonNullValues = "";
			$.each(fd.dataDescriptor, function (key, val) {
				nonNullValues += (val ? "<label>" + key + ": <span>"+ val +"</span></label>" : "");
			});
			return "<p class='tooltip-paragraph'>" + nonNullValues + "</p>";
        };
        $(".ui-helper-hidden-accessible").html("");
		if ( element.is( ".l-n-p-i" ) ) {
            id = $(this).closest(".n-p-i-wrapp").attr("id");
			return renderPortTP(wfPlumbCanvasData.ports[id].fullData);
        }
        if ( element.is( ".l-n-p-o" ) ) {
            id = $(this).closest(".n-p-o-wrapp").attr("id");
            return renderPortTP(wfPlumbCanvasData.ports[id].fullData);
        }
    }
});
//

var tao_adModuleToSelection = function(id){
	if( $.inArray( id, toolboxModules.selected ) !== -1 ){
		return; //check if tao module already in current selection and then do nothing
	}
	
	if(!keyboardShifted){ //if keyboard is shifted keep current selection else unselect al modules on workspace
		$(".w",$elCanvas).removeClass("selected");
    }
    $("#" + id).addClass("selected");
    if ($(".w.selected").length === 1) {
        toolboxModules.firstSelectedId = id;
    }
	toolboxModules.rescanSelected();
    console.log("mousedown on " + id);
};
var tao_adGroupNodesToSelection = function(groupCanvasID){
    console.log("add group to selection");
    if(!keyboardShifted){ //if keyboard is shifted keep current selection else unselect al modules on workspace
        $(".w",$elCanvas).removeClass("selected");
    }
    $(".g_"+groupCanvasID , $elCanvas).each(function(index) {
        var nodeID = $(this).attr("id");
        $("#"+nodeID).addClass("selected");
    });
    toolboxModules.rescanSelected();
};

//groupers and sorters ui
(function(){
    var $elModalSG = $("#modalSortAndGroup");
    var $elSelectSortType = $("#selectSortType");
	var $elSelectFilterType = $("#selectFilterType");
    var $elSelectSortDirection = $("#selectSortDirection");
    var $elselectGroupType = $("#selectGroupType");
    var $elinputGroupingArg = $("#inputGroupingArg");
	var $elinputFilteringArg = $("#inputFilteringArg");
    var $elFrmConnectorEdit = $("#frmConnectorEdit");
   
    //populate sorter & groupers
    window.wf_populateSortersAndGroupers = function(){
        if((wfTools.configSorters) && (wfTools.configSorters.length>0)){
            $.each(wfTools.configSorters, function (i, item) {
                $elSelectSortType.append($('<option>', {
                    value: item,
                    text : item
                }));
            });
        }
		if((wfTools.configFilters) && (wfTools.configFilters.length>0)){
            $.each(wfTools.configFilters, function (i, item) {
                $elSelectFilterType.append($('<option>', {
                    value: item[0],
                    text : item[0]
                }));
            });
        }
        if((wfTools.configGroupers) && (wfTools.configGroupers.length>0)){
            $.each(wfTools.configGroupers, function (i, item) {
                $elselectGroupType.append($('<option>', {
                    value: item[0],
                    text : item[0]
                }));
            });
        }
    };

    //attach handler for sorter and grouper modal
    $($elCanvas)
    .on("click",".btnSG", function(){
        var connid = $(this).data("connid");
        console.log("edit conn: "+connid);
        var connData = wfPlumbCanvasData.getConnectorById(connid);

		var sourceNodeId = connData.from.split("_")[1];
		var targetNodeId = connData.to.split("_")[1];
		var sourceNodeData = wfPlumbCanvasData.getNodeById(sourceNodeId);
		var targetNodeData = wfPlumbCanvasData.getNodeById(targetNodeId);

        $elModalSG.data("connid", connid).modal("show");
        $elSelectSortType.val("none").change();
        $elselectGroupType.val("none").change();
        $elSelectFilterType.val("").change();

        if(connData.linkData.aggregator && connData.linkData.aggregator.sorter && connData.linkData.aggregator.sorter[0]){
            $elSelectSortType.val(connData.linkData.aggregator.sorter[0]).trigger("change");
        }
		
		if (sourceNodeData.componentType == "DATASOURCE" && (targetNodeData.componentType == "DATASOURCE" || targetNodeData.componentType == "PROCESSING")) {
			//grouping is allowed only between two Datasource components
			if (targetNodeData.componentType == "DATASOURCE") {
				$(".grouping", "#modalSortAndGroup").show();
				if (connData.linkData.aggregator && connData.linkData.aggregator.associator && connData.linkData.aggregator.associator[0]) {
					$elselectGroupType.val(connData.linkData.aggregator.associator[0]).trigger("change");
					if (connData.linkData.aggregator.associator[1]) {
						$elinputGroupingArg.val(connData.linkData.aggregator.associator[1]).trigger("change");
					}
				}
			} else {
				$(".grouping", "#modalSortAndGroup").hide();
			}
			//filtering is allowed between Datasource and processing component too
			$(".filtering", "#modalSortAndGroup").show();
			$elinputFilteringArg.val("").trigger("change");
			if (connData.linkData.aggregator && connData.linkData.aggregator.filter && connData.linkData.aggregator.filter[0]) {
				$elSelectFilterType.val(connData.linkData.aggregator.filter[0]).trigger("change");
				if (connData.linkData.aggregator.filter[1]) {
					$elinputFilteringArg.val(connData.linkData.aggregator.filter[1]).trigger("change");
				}
			}
		} else {
			$(".grouping", "#modalSortAndGroup").hide();
			$(".filtering", "#modalSortAndGroup").hide();
		}
    });
    $elSelectSortType
    .on("change", function(){
        var val = $(this).val();
        if(val !== 'none'){
            $elSelectSortDirection.closest(".sorting-direction").removeClass("collapse ");
        }else{
            $elSelectSortDirection.closest(".sorting-direction").addClass("collapse ");
        }
    });
    $elselectGroupType
    .on("change", function(){
        var val = $(this).val();
        var currentGrouper = jQuery.grep(wfTools.configGroupers, function( a ) {
            return a[0]=== val;
        });
        if (currentGrouper && currentGrouper[0] && currentGrouper[0][1]) {
			addExtraField(currentGrouper[0][1], $elinputGroupingArg, "Quota");
			$elinputGroupingArg.closest(".grouping-params").removeClass("collapse");
		} else {
			 $elinputGroupingArg.closest(".grouping-params").addClass("collapse");
		}
    });
	$elSelectFilterType
    .on("change", function(){
        var val = $(this).val();
        var currentFilter = jQuery.grep(wfTools.configFilters, function( a ) {
            return a[0]=== val;
        });
        if (currentFilter && currentFilter[0] && currentFilter[0][1]) {
			addExtraField(currentFilter[0][1], $elinputFilteringArg, "H:ss");
			$elinputFilteringArg.closest(".filtering-params").removeClass("collapse");
		} else {
			 $elinputFilteringArg.closest(".filtering-params").addClass("collapse");
		}
    });
    $elFrmConnectorEdit
    .on("submit", function(e){
        e.preventDefault();
		var clickedButtonId = $(document.activeElement).attr('id');
		var connid = $elModalSG.data("connid");
		
		if ( clickedButtonId === "btnSave") {
			
			var sorter = [$elSelectSortType.val(), $elSelectSortDirection.val()];
			var associator = [$elselectGroupType.val()];
			if(!$elinputGroupingArg.closest(".grouping-params").hasClass( "collapse" )){
				associator[1] = $elinputGroupingArg.val();
			}
			var filter = [$elSelectFilterType.val()];
			if(!$elinputFilteringArg.closest(".filtering-params").hasClass( "collapse" )){
				filter[1] = $elinputFilteringArg.val();
			}
			if(sorter[0] === 'none') sorter = null;
			if(associator[0] === 'none') associator = null;
			if(filter[0] === '') filter = null;
			var aggregator = {
				"sorter": sorter,
				"associator": associator,
				"filter": filter
			};
			if((sorter === null) && (associator === null) && (filter === null)) aggregator = null;

			console.log("agregator"); console.log(aggregator);

			var connData = wfPlumbCanvasData.getConnectorById(connid);
			var targetNodeId = connData.to.split("_")[1];
			var linkToUpdate;
			var linkFound = 0;

			console.log(targetNodeId);
			var nodeData = wfPlumbCanvasData.getNodeById(targetNodeId);
			if(nodeData.incomingLinks){
				nodeData.incomingLinks.forEach(function(link) {
					if(link === connData.linkData){
						linkToUpdate = link;
						linkFound++;
					}
				});
			}
			if(linkFound !== 1){
				alert("Unbable to identify link in node definition. Please reload workflow and try again.");
				return;
			}
			else{
				linkToUpdate.aggregator = aggregator;
			}
		  //  alert("update connector "+connid);

			$.when(putOneNode(currentWfID, nodeData))
				.done(function (putOneNodeResponse) {
					if(putOneNodeResponse.status === "SUCCEEDED"){
					  //  linkToUpdate.aggregator = aggregator;
						$(".v-lastaction","#infoband").html("link updated");
						//wfPlumbCanvasData.nodes[$propbar.nid] = putOneComponentResponse.data;
						//canvasRenderer.updateNodeById($propbar.nid, putOneComponentResponse.data);

						//cma:if agregator added, append icon to div with id=$('#' + connid)
					   if ( aggregator )
						{
							$('#' + connid).empty();
							$('#' + connid).append(
								"<svg width=\"48\" height=\"50\">\n" +
								"  <g transform=\"scale(4)\"><path fill=\"#fff\" stroke=\"#3c8dbc\" stroke-width=\".3\" d=\"M5.9,1.2L0.7,6.5l5.2,5.4l5.2-5.4L5.9,1.2z\" /></g>\n" +
								"  <g transform=\"scale(0.03) translate(420 600)\"><path fill=\"#3c8dbc\" d=\"M512.1 191l-8.2 14.3c-3 5.3-9.4 7.5-15.1 5.4-11.8-4.4-22.6-10.7-32.1-18.6-4.6-3.8-5.8-10.5-2.8-15.7l8.2-14.3c-6.9-8-12.3-17.3-15.9-27.4h-16.5c-6 0-11.2-4.3-12.2-10.3-2-12-2.1-24.6 0-37.1 1-6 6.2-10.4 12.2-10.4h16.5c3.6-10.1 9-19.4 15.9-27.4l-8.2-14.3c-3-5.2-1.9-11.9 2.8-15.7 9.5-7.9 20.4-14.2 32.1-18.6 5.7-2.1 12.1.1 15.1 5.4l8.2 14.3c10.5-1.9 21.2-1.9 31.7 0L552 6.3c3-5.3 9.4-7.5 15.1-5.4 11.8 4.4 22.6 10.7 32.1 18.6 4.6 3.8 5.8 10.5 2.8 15.7l-8.2 14.3c6.9 8 12.3 17.3 15.9 27.4h16.5c6 0 11.2 4.3 12.2 10.3 2 12 2.1 24.6 0 37.1-1 6-6.2 10.4-12.2 10.4h-16.5c-3.6 10.1-9 19.4-15.9 27.4l8.2 14.3c3 5.2 1.9 11.9-2.8 15.7-9.5 7.9-20.4 14.2-32.1 18.6-5.7 2.1-12.1-.1-15.1-5.4l-8.2-14.3c-10.4 1.9-21.2 1.9-31.7 0zm-10.5-58.8c38.5 29.6 82.4-14.3 52.8-52.8-38.5-29.7-82.4 14.3-52.8 52.8zM386.3 286.1l33.7 16.8c10.1 5.8 14.5 18.1 10.5 29.1-8.9 24.2-26.4 46.4-42.6 65.8-7.4 8.9-20.2 11.1-30.3 5.3l-29.1-16.8c-16 13.7-34.6 24.6-54.9 31.7v33.6c0 11.6-8.3 21.6-19.7 23.6-24.6 4.2-50.4 4.4-75.9 0-11.5-2-20-11.9-20-23.6V418c-20.3-7.2-38.9-18-54.9-31.7L74 403c-10 5.8-22.9 3.6-30.3-5.3-16.2-19.4-33.3-41.6-42.2-65.7-4-10.9.4-23.2 10.5-29.1l33.3-16.8c-3.9-20.9-3.9-42.4 0-63.4L12 205.8c-10.1-5.8-14.6-18.1-10.5-29 8.9-24.2 26-46.4 42.2-65.8 7.4-8.9 20.2-11.1 30.3-5.3l29.1 16.8c16-13.7 34.6-24.6 54.9-31.7V57.1c0-11.5 8.2-21.5 19.6-23.5 24.6-4.2 50.5-4.4 76-.1 11.5 2 20 11.9 20 23.6v33.6c20.3 7.2 38.9 18 54.9 31.7l29.1-16.8c10-5.8 22.9-3.6 30.3 5.3 16.2 19.4 33.2 41.6 42.1 65.8 4 10.9.1 23.2-10 29.1l-33.7 16.8c3.9 21 3.9 42.5 0 63.5zm-117.6 21.1c59.2-77-28.7-164.9-105.7-105.7-59.2 77 28.7 164.9 105.7 105.7zm243.4 182.7l-8.2 14.3c-3 5.3-9.4 7.5-15.1 5.4-11.8-4.4-22.6-10.7-32.1-18.6-4.6-3.8-5.8-10.5-2.8-15.7l8.2-14.3c-6.9-8-12.3-17.3-15.9-27.4h-16.5c-6 0-11.2-4.3-12.2-10.3-2-12-2.1-24.6 0-37.1 1-6 6.2-10.4 12.2-10.4h16.5c3.6-10.1 9-19.4 15.9-27.4l-8.2-14.3c-3-5.2-1.9-11.9 2.8-15.7 9.5-7.9 20.4-14.2 32.1-18.6 5.7-2.1 12.1.1 15.1 5.4l8.2 14.3c10.5-1.9 21.2-1.9 31.7 0l8.2-14.3c3-5.3 9.4-7.5 15.1-5.4 11.8 4.4 22.6 10.7 32.1 18.6 4.6 3.8 5.8 10.5 2.8 15.7l-8.2 14.3c6.9 8 12.3 17.3 15.9 27.4h16.5c6 0 11.2 4.3 12.2 10.3 2 12 2.1 24.6 0 37.1-1 6-6.2 10.4-12.2 10.4h-16.5c-3.6 10.1-9 19.4-15.9 27.4l8.2 14.3c3 5.2 1.9 11.9-2.8 15.7-9.5 7.9-20.4 14.2-32.1 18.6-5.7 2.1-12.1-.1-15.1-5.4l-8.2-14.3c-10.4 1.9-21.2 1.9-31.7 0zM501.6 431c38.5 29.6 82.4-14.3 52.8-52.8-38.5-29.6-82.4 14.3-52.8 52.8z\"/></g>\n" +
								"</svg>\n" 
							);            
						  }
						else //cma:if agregator deleted(select <none> on sorting and grouping options), delete the icon
						{
							$('#' + connid).empty();
						}

						$elModalSG.modal("hide");
					}else{
						alert("Could not update link." + putOneComponentResponse.message);
					}
				})
				.fail(function(jqXHR){
					chkXHR(jqXHR.status);
					alert("Could udate link", "ERROR");
				});
		}
		
		if (clickedButtonId === "btnDelete") {
			$('#confirm-dialog').modal('confirm',{
				msg:"Are you sure you want to delete selected connector?",
				callbackConfirm: function() {
					var connection = window.jsp.getConnections().filter(function(item){if(item.id === connid) {return item;}});
					window.jsp.deleteConnection(connection[0]); //this itself will trigger connectionDetached event
					console.log("delete connection id:" +connection.id);
					$elModalSG.modal("hide");
				},
				callbackCancel:function(){
					var connection = window.jsp.getConnections().filter(function(item){if(item.id === connid) {return item;}});
					connection[0].removeClass("conn-to-be-deleted");
				}
			});
		}
    });
	
	$elModalSG.on("hide.bs.modal", function () {
		var connid = $(this).data("connid");
		var connection = window.jsp.getConnections().filter(function(item){if(item.id === connid) {return item;}});
		if (connection.length > 0) {
			connection[0].removeClass("conn-to-be-deleted");
		}
		$elModalSG.data("connid", 0);
	});
}());

//ajax functions
//put node on server (update)
function putOneNode(wfID, payload){
    return $.ajax({
        cache: false,
        url: baseRestApiURL + "workflow/node?workflowId=" + wfID,
        dataType : 'json',
        type: 'PUT',
        data: JSON.stringify(payload),
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.parent.tokenKey
        }
    });
}
//put connection on server
function putOneConnection(s,t){
    return $.ajax({
        cache: false,
        url: baseRestApiURL + "workflow/link?sourceNodeId="+s[1]+"&sourceTargetId="+s[2]+"&targetNodeId="+t[1]+"&targetSourceId=" + t[2],
        dataType : 'json',
        type: 'POST',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.parent.tokenKey
        }
    });
}
//post node position on server
function postNodesPosition(wfID,payload){
    return $.ajax({
        cache: false,
        url: baseRestApiURL + "workflow/positions?workflowId=" + wfID,
        dataType : 'json',
        type: 'POST',
        data: JSON.stringify(payload),
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.parent.tokenKey
        }
    });
}
//post a new component (node) on server
function postOneComponent(wfID,payload){
    return $.ajax({
        cache: false,
        url: baseRestApiURL + "workflow/node?workflowId=" + wfID,
        dataType : 'json',
        type: 'POST',
        data: JSON.stringify(payload),
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.parent.tokenKey
        }
    });
}
//delete one component (node) on server
function delOneNode(wfID, node){
    return $.ajax({
        cache: false,
        url: baseRestApiURL + "workflow/node?workflowId="+wfID,
        data: JSON.stringify(node),
        type: 'DELETE',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.parent.tokenKey
        }
    });
}
//delete one connection (link) on server
function delOneLink(nodeId, payload){
    return $.ajax({
        cache: false,
        url: baseRestApiURL + "workflow/link?nodeId="+nodeId,
        dataType : 'json',
        data: JSON.stringify(payload),
        type: 'DELETE',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.parent.tokenKey
        }
    });
}
//get all config sorters
function getConfigSorters(){
    return $.ajax({
        cache: false,
        url: baseRestApiURL + "config/sorters",
        dataType : 'json',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.parent.tokenKey
        }
    });
}
//get all config filters
function getConfigFilters(){
    return $.ajax({
        cache: false,
        url: baseRestApiURL + "config/filters",
        dataType : 'json',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.parent.tokenKey
        }
    });
}
//get all config groupers
function getConfigGroupers(){
    return $.ajax({
        cache: false,
        url: baseRestApiURL + "config/groupers",
        dataType : 'json',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.parent.tokenKey
        }
    });
}
//get all components for toolbox
function getAllComponents(){
    return $.ajax({
        cache: false,
        url: baseRestApiURL + "component/",
        dataType: 'json',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.parent.tokenKey
        }
    });
}
//get all queries for toolbox
function getAllQueries(){
    return $.ajax({
        cache: false,
        url: baseRestApiURL + "query/",
        dataType: 'json',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.parent.tokenKey
        }
    });
}
//get all datasources for toolbox
function getAllDatasources(){
    return $.ajax({
        cache: false,
        url: baseRestApiURL + "datasource/",
        dataType: 'json',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.parent.tokenKey
        }
    });
}
//get all user datasources for toolbox
function getAllUserDatasources(){
    return $.ajax({
        cache: false,
        url: baseRestApiURL + "datasource/user/",
        dataType: 'json',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.parent.tokenKey
        }
    });
}
//
function getAllSensors(){
    return $.ajax({
        cache: false,
        url: baseRestApiURL + "query/sensor/",
        dataType: 'json',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.parent.tokenKey
        }
    });
}
//
function getAllDockers(){
    return $.ajax({
        cache: false,
        url: baseRestApiURL + "docker/",
        dataType: 'json',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.parent.tokenKey
        }
    });
}
//
function getConfigEnums(){
    return $.ajax({
        cache: false,
        url: baseRestApiURL + "config/enums",
        dataType: 'json',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.parent.tokenKey
        }
    });
}

function addExtraField(fieldType, elem, placeholderVal){
	// remove info message added on default case
	elem.parent().find("p").remove();
	// show element hidden on default case
	elem.show();
	// show element label hidden on default case
	elem.parent().siblings("label").show();
	//workaround
	if(fieldType.toLowerCase() === "date" && placeholderVal === "H:ss") fieldType = "time";
	switch(fieldType.toLowerCase()) {
		case "int":
			elem.attr({
				"type": "number",
				"step": "1",
				"placeholder": placeholderVal,
			});
			break;
		case "double": case "float":
			elem.attr({
				"type": "number",
				"step": "1",
				"placeholder": placeholderVal,
			});
			break;
		case "string":
			elem.attr({
				"type": "text",
				"step": "1",
				"placeholder": placeholderVal,
			});
			break;
		case "date":
			elem.attr({
				"type": "text",
				"placeholder": placeholderVal,
			});
			if(!elem.hasClass("datepicker")) elem.addClass("datepicker");
			//remove old datepickers
			$("#" + $.datepicker.dpDiv.attr("id")).remove();
			elem.datepicker({
				changeYear	: true,
				changeMonth : true,
				dateFormat  : "yyyy-mm-dd",
				yearRange   : "1990:c+10"
			});
			break;
			case "time":
				elem.attr({
					"type": "text",
					"placeholder": placeholderVal,
				});
				if(!elem.hasClass("timepicker")) elem.addClass("timepicker");
				elem.timepicker({
					timeFormat: 'H:mm',
					interval: 30,
					minTime: '00:00',
					maxTime: '23:59',
					dynamic: false,
					dropdown: true,
					scrollbar: true,
					zindex: 1151
				});
				break;
		default:
			//hide element and label
			elem.hide();
			elem.parent().siblings("label").hide();
			//show info massage
			elem.parent().append("<p>Type ["+fieldType+"] unknown for this option.</p>");
			break;
	};
}