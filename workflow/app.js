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

var toolboxModules ={
	selected: [],
	count: 0,
	rmSelected: function(){
		if(toolboxModules.selected.length === 0) {return;}
		jsp.clearDragSelection();
		$.each(toolboxModules.selected, function(index, item) {
                    wf_removeNode(item);
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
		if(toolboxModules.selected.length === 1){
			//to do
		}
		if(toolboxModules.selected.length > 1){
            //to do
		}
		if(toolboxModules.selected.length === 0){
            //to do
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
    toolboxSidebar.init();
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
    var postNodesPosition = $.ajax({
        cache: false,
        url: baseRestApiURL + "workflow/positions?workflowId=" + currentWfID,
        dataType : 'json',
        type: 'POST',
        data: JSON.stringify(lcl_postdata),
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.tokenKey
        }
    });
    $.when(postNodesPosition)
        .done(function (putOneComponentResponse) {
            $(".v-lastaction","#infoband").html("position updated");
        })
        .fail(function(){
            alert("Could not udate position", "ERROR");
        });
});

jsPlumb.bind("tao_dropNewNode", function(params) {
    console.log("plumb:tao_dropNewNode");
    var lcl_postdata = params[0].fullData;
    var postOneComponent = $.ajax({
        cache: false,
        url: baseRestApiURL + "workflow/node?workflowId=" + currentWfID,
        dataType : 'json',
        type: 'POST',
        data: JSON.stringify(lcl_postdata),
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.tokenKey
        }
    });
    $.when(postOneComponent)
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
        .fail(function(){
            alert("Could not add node", "ERROR");
        });
});




jsPlumb.bind("tao_loadWorkflowById", function() {
    tao_resetShadowData();
    tao_resetCanvasData();
    var getAllComponents = $.ajax({
        cache: false,
        url: baseRestApiURL + "component/",
        dataType : 'json',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.tokenKey
        }
    });
    var getAllQueries = $.ajax({
        cache: false,
        url: baseRestApiURL + "query/",
        dataType : 'json',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.tokenKey
        }
    });
	var getAllDatasources = $.ajax({
        cache: false,
        url: baseRestApiURL + "datasource/",
        dataType : 'json',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.tokenKey
        }
    });
    var getAllUserDatasources = $.ajax({
        cache: false,
        url: baseRestApiURL + "datasource/user/",
        dataType : 'json',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.tokenKey
        }
    });
    var getAllSensors = $.ajax({
        cache: false,
        url: baseRestApiURL + "query/sensor/",
        dataType : 'json',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.tokenKey
        }
    });
    var getAllDockers = $.ajax({
        cache: false,
        url: baseRestApiURL + "docker/",
        dataType : 'json',
        type: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Auth-Token": window.tokenKey
        }
    });


    $.when(getAllComponents,getAllQueries,getAllDatasources,getAllUserDatasources,getAllSensors,getAllDockers)
        .done(function (getAllComponentsResponse,getAllQueriesResponse,getAllDatasourcesResponse,getAllUserDatasourcesResponse,getAllSensorsResponse,getAllDockersResponse) {
            console.log("Workspace components init start.");
            wfTools.components = getAllComponentsResponse[0]['data'];
            wfTools.queries = getAllQueriesResponse[0]['data'];
            wfTools.datasources = getAllDatasourcesResponse[0]['data'];
            wfTools.udatasources = getAllUserDatasourcesResponse[0]['data'];
            wfTools.sensors = getAllSensorsResponse[0]['data'];
            wfTools.dockers = getAllDockersResponse[0]['data'];

            //parse components, try to detect orfan and collapsing data, recreate local IDs
            $.each(wfTools.components, function(i, item) {
                var hash = "tboid"+jsHashCode(item.id);
            	if(wfTools.toolboxnodes.pc[hash]){
            		alert("Processing components collision. duplicate id detected");
				}else{
                    wfTools.toolboxnodes.pc[hash] = {
                    	id: hash,
						type: "component",
						label: item.label,
						dna: item
                    };
				}
            });
            $.each(wfTools.queries, function(i, item) {
                var hash = "tboid"+jsHashCode(item.sensor+"-"+item.dataSourceName);
                if(wfTools.toolboxnodes.q[hash]){
                    alert("Sensors collision. duplicate id detected");
                }else{
                    wfTools.toolboxnodes.q[hash] = {
                        id: hash,
                        type: "query",
                        label: item.sensor+"-"+item.dataSourceName,
                        dna: item
                    };
                }
            });
            $.each(wfTools.datasources, function(i, item) {
                var hash = "tboid"+jsHashCode(item.id);
                if(wfTools.toolboxnodes.q[hash]){
                    if(wfTools.toolboxnodes.pc[hash]){
                        alert("Datasource collision. duplicate id detected");
                    }else{
                        wfTools.toolboxnodes.ds[hash] = {
                            id: hash,
                            type: "datasource",
                            label: item.label,
                            dna: item
                        };
                    }
                }else{
                    console.log("Unknown query for datasource");
                    alert("Unknown query for datasource id: "+item.id+"\nIgnoring datasource.");
				}
            });
//user datasources
            $.each(wfTools.udatasources, function(i, item) {
                var hash = "tboid"+jsHashCode(item.id);
                //if(wfTools.toolboxnodes.q[hash]){
                    if(wfTools.toolboxnodes.pc[hash]){
                        alert("Datasource collision. duplicate id detected");
                    }else{
                        wfTools.toolboxnodes.uds[hash] = {
                            id: hash,
                            type: "udatasource",
                            label: item.label,
                            dna: item
                        };
                    }
                //}else{
//                    console.log("Unknown query for datasource");
//                    alert("Unknown query for datasource id: "+item.id+"\nIgnoring datasource.");
//                }
            });


            wf_renderComponentsToolBox();
            console.log("Workspace components toolbox init done.");
            wf_loadWorkflowById(currentWfID);
        })
        .fail(function(){
            alert("Could not retrive workspace data. Unable to proceed");
        });
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
                jsPlumb.fire("jsPlumbSetZoom", wfZoom);
				makeWFPreview();
            }
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
        });

		$("#preview-zoom-toolbar").on("click", ".preview-toolbar-action", function(){
			var action = $(this).data("action");
			if( (action === "pan-left") || (action === "pan-right") || (action === "pan-up") || (action === "pan-down") ){
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
    // bind a click listener to each connection; the connection is deleted
    instance.bind("click", function (c) {
        console.log("click: delete connection id:" +c.id);
        instance.deleteConnection(c); //this itself will trigger connectionDetached event
        //delete wfPlumbCanvasData.connectors[c.id];
    });
    instance.bind("connectionDetached", function (info, originalEvent) {
        console.log("connectionDetached: delete connection id:" + info.connection.id);
        var lcl_payload = wfPlumbCanvasData.connectors[info.connection.id].linkData;
        var lcl_to = wfPlumbCanvasData.connectors[info.connection.id].to;
        var lcl_nodeId = parseInt(lcl_to.split("_")[1]);
        //check if link exists or is just a revert connection event.
        //check if parent node exists before calling delete
        if(_.invert(wfPlumbCanvasData.nodesMap)[lcl_nodeId]){
            var delOneLink = $.ajax({
                cache: false,
                url: baseRestApiURL + "workflow/link?nodeId="+lcl_nodeId,
                dataType : 'json',
                data: JSON.stringify(lcl_payload),
                type: 'DELETE',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "X-Auth-Token": window.tokenKey
                }
            });
            $.when(delOneLink)
                .done(function (delOneLinkResponse) {
                    var r = chkTSRF(delOneLinkResponse);
                    if((delOneLinkResponse.status === "SUCCEEDED") && (r.id === lcl_nodeId)){
                        delete wfPlumbCanvasData.connectors[info.connection.id];
                        $(".v-lastaction","#infoband").html("link removed");
                    } else {
                        alert("Could not delete link");
                        //to do revert link on canvas
                    }
                })
                .fail(function(){
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
        var toID = _.invert(wfPlumbCanvasData.nodesMap)[t[1]];
        var linkData = (_.find(wfPlumbCanvasData.nodes[toID].incomingLinks, function(item) {
            return (item.output.id === t[2] && item.input.id === s[2]);
        }));
        //console.log("TO id:"+toID);console.log(linkData);

        //register connection to canvasdata
        wfPlumbCanvasData.connectors[info.connection.id] = ({"from":info.sourceId, "to":info.targetId, "linkData":linkData});

        console.log("waw connection binded event, update model ...");
        if(wfPlumbCanvasData.loaded){
            //put connection on server
            var putOneConnection = $.ajax({
                cache: false,
                url: baseRestApiURL + "workflow/link?sourceNodeId="+s[1]+"&sourceTargetId="+s[2]+"&targetNodeId="+t[1]+"&targetSourceId=" + t[2],
                dataType : 'json',
                type: 'POST',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "X-Auth-Token": window.tokenKey
                }
            });
            $.when(putOneConnection)
                .done(function (putOneConnectionResponse) {
                    var r = chkTSRF(putOneConnectionResponse);
                    if((putOneConnectionResponse.status === "SUCCEEDED") && r.id){
                        $(".v-lastaction","#infoband").html("connection added");
                        var linkData = (_.find(r.incomingLinks, function(item) {
                            return (item.output.id === t[2] && item.input.id === s[2]);
                        }));

                        wfPlumbCanvasData.connectors[info.connection.id] = ({"from":info.sourceId, "to":info.targetId, "linkData":linkData});
                    } else {
                        alert("Incompatiple source and target. Reverting");
                        jsp.deleteConnection(info.connection);
                        delete wfPlumbCanvasData.connectors[info.connection.id];
                    }
                })
                .fail(function(){
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

        var delOneNode = $.ajax({
            cache: false,
            url: baseRestApiURL + "workflow/node?workflowId="+currentWfID,
            //dataType : "text",
            data: JSON.stringify(wfPlumbCanvasData.nodes[el]),
            type: 'DELETE',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Auth-Token": window.tokenKey
            }
        });
        $.when(delOneNode)
            .done(function (delOneNodeResponse) {
                console.log(delOneNodeResponse);
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

        $('#confirm-dialog').modal('confirm',{
            msg:"Are you sure you want to delete selected node?",
            callbackConfirm: function() {
                toolboxModules.rescanSelected();
                toolboxModules.rmSelected();
                console.log(id);
            },
            callbackCancel:function(){}
        });
	})
    .on( "click",".btn-action-groupmodule", function(e) { //group selected modules
        e.stopPropagation();
        var nodeID = $(this).closest(".w").attr("id");
        console.log("group invocation");
        toolboxModules.rescanSelected();
        if (toolboxModules.selected.length<2){
            alert("You need to select at least 2 components in order to create a group.");
        }


            $('#confirm-dialog').modal('confirm',{
            msg:"Are you sure you want to group the selected modules?",
            callbackConfirm: function() {
                //toolboxModules.rmSelected();
                //console.log(id);
            },
            callbackCancel:function(){}
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
    });

//tooltip
$( document ).uitooltip({
    items: ".l-n-p-i, .l-n-p-o",
    content: function() {
        var element = $( this );
        var id = null;
        var renderPortTP = function(fd){
            return "port data descriptor:"
                +"<p class=\"tooltip-paragraph\">"
                +"<span>format type: "+ fd.dataDescriptor.formatType +"</span>"
                //+"<br><span>crs: "+ fd.dataDescriptor.crs +"</span>"
                //+"<br><span>dimension: "+ fd.dataDescriptor.dimension +"</span>"
                //+"<br><span>geometry: "+ fd.dataDescriptor.geometry +"</span>"
                //+"<br><span>location: "+ fd.dataDescriptor.location +"</span>"
                +"<br><span>sensorType: "+ fd.dataDescriptor.sensorType +"</span>"
                +"</p>";
        };
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
	$("#"+id).addClass("selected");
	toolboxModules.rescanSelected();
	console.log("mousedown on "+id);
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


