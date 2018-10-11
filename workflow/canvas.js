var wfPlumbCanvasData = {};
var tao_resetCanvasData = function() {
    wfPlumbCanvasData = {
        _remote: {
            response: null
        },
        header: {
            id: 0,
            name: "No name",
            status: "",
            username: "",
            visibility: ""
        },
        nodeTemplates:{
            pc:{},
            ds:{}
        },
        nodes: {},
        ports: {},
        nodesMap: {},
        groups: [],
        connectors: {},
        position: {
            x: 0,
            y: 0
        },
        zoom: 1,
        prefs: {
            conn_style: 0
        },
        loaded: false
    };
};
tao_resetCanvasData();

var tao_setWF2CanvasData = function(currentWfData){
    wfPlumbCanvasData._remote = currentWfData;
    //clone wf data only, no nodes info
    wfPlumbCanvasData.wf = $.extend({}, currentWfData); wfPlumbCanvasData.wf.nodes = [];
    wfPlumbCanvasData.header.id = currentWfData.id;
    wfPlumbCanvasData.header.name = currentWfData.name;
    wfPlumbCanvasData.header.status = currentWfData.status;
    wfPlumbCanvasData.header.username = currentWfData.userName;
    wfPlumbCanvasData.header.visibility = currentWfData.visibility;
    wfPlumbCanvasData.usedComponents = [];
    var nodesNo = wfPlumbCanvasData._remote.nodes.length;
    for (var i = 0; i < nodesNo; i++) {
        wfPlumbCanvasData.usedComponents.push(wfPlumbCanvasData._remote.nodes[i].componentId);
    }
};


    var wf_removeAllNodes = function(){
		//todo: alert for delete all
        console.log("f:wf_removeAllNodes");
		$(".w", $elCanvas).addClass("selected");
        toolboxModules.rescanSelected();
        toolboxModules.rmSelected();
    };
	////////////////////////////
    var wf_updateWorkflowById = function(x,y,zoom) {
        //update shadow model, lazy server update follows
        var matrix = pz.panzoom('getMatrix');

        if(x) wfPlumbCanvasData.wf.xCoord = x; else wfPlumbCanvasData.wf.xCoord = matrix[4];
        if(y) wfPlumbCanvasData.wf.yCoord = y; else wfPlumbCanvasData.wf.yCoord = matrix[5];
        if(zoom) wfPlumbCanvasData.wf.zoom = zoom; else wfPlumbCanvasData.wf.zoom = matrix[0];
        lazy_updatePosOnServer();
    };

    //update workflow canvas position on server
    var updatePosOnServer = function(){
        console.log("position server updated");
        var putWorkflowById = $.ajax({
            cache: false,
            type: 'PUT',
            url: baseRestApiURL + "workflow/" + wfPlumbCanvasData.wf.id + "/?rnd=" + Math.random(),
            dataType: 'json',
            data: JSON.stringify(wfPlumbCanvasData.wf),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Auth-Token": window.tokenKey
            }
        });
        $.when(putWorkflowById)
            .done(function (putWorkflowById) {
                console.log("wf position updated");
            })
            .fail(function () {
                alert("Could not update  workflow data.");
            });
    };
    //debounced function
    var lazy_updatePosOnServer = _.debounce(updatePosOnServer, 400);


    var wf_loadWorkflowById = function(wfId){
        console.log("f:wf_loadWorkflowById , load workflow: "+wfId);
        var getWorkflowById = $.ajax({
            cache: false,
            url: baseRestApiURL + "workflow/"+wfId+"/?rnd=" + Math.random(),
            dataType : 'json',
            type: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Auth-Token": window.tokenKey
            }
        });
        $.when(getWorkflowById)
        .done(function (getWorkflowByIdResponse) {
            var currentWfData = chkTSRF(getWorkflowByIdResponse);
            console.log("workflow data:"); console.log(currentWfData);
            tao_setWF2CanvasData(currentWfData);
            //render workflow header
            toolboxHeader.populate(wfPlumbCanvasData.header).open();

            //get component templates for all components in workflow
            var componentsListQueryString = wfPlumbCanvasData.usedComponents.join(',');
            var getComponentsList = $.ajax({
                cache: false,
                url: baseRestApiURL + "component/list?id="+componentsListQueryString,
                dataType : 'json',
                type: 'GET',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "X-Auth-Token": window.tokenKey
                }
            });
            var getDatasourcesList = $.ajax({
                cache: false,
                url: baseRestApiURL + "datasource/list?id="+componentsListQueryString,
                dataType : 'json',
                type: 'GET',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "X-Auth-Token": window.tokenKey
                }
            });
            $.when(getComponentsList, getDatasourcesList)
                .done(function (getComponentsListResponse, getDatasourcesListResponse) {
                    var currentWfComponentsList = chkTSRF(getComponentsListResponse[0]);
                    var currentWfDatasourcesList = chkTSRF(getDatasourcesListResponse[0]);
                    console.log("workflow components:"); console.log(currentWfComponentsList);
                    console.log("workflow datasopurces:"); console.log(currentWfDatasourcesList);
                    $.each(currentWfComponentsList, function(i, item) {
                        var hash = "tboid"+jsHashCode(item.id);
                        if(wfPlumbCanvasData.nodeTemplates.pc[hash]){
                            alert("Processing components collision. duplicate id detected");
                        }else{
                            wfPlumbCanvasData.nodeTemplates.pc[hash] = {
                                id: hash,
                                type: "component",
                                image: "./media/module-otb.png",
                                label: item.label,
                                dna: item
                            };
                        }
                    });
                    $.each(currentWfDatasourcesList, function(i, item) {
                        var hash = "tboid"+jsHashCode(item.id);
                        if(wfPlumbCanvasData.nodeTemplates.pc[hash]){
                            alert("Datasource components collision. duplicate id detected");
                        }else{
                            wfPlumbCanvasData.nodeTemplates.ds[hash] = {
                                id: hash,
                                type: "datasource",
                                image: "./media/module-ds.png",
                                label: item.label,
                                dna: item
                            };
                        }
                    });
                    //render nodes
                    $.each(currentWfData.nodes, function(i, wfOneNode) {
                        console.log("addNewNode call");
                        console.log(wfOneNode);
                        var ntype = "unknown";
                        if(wfOneNode.componentType === "DATASOURCE"){
                            ntype = "ds";
                        }
                        if(wfOneNode.componentType === "PROCESSING"){
                            ntype = "pc";
                        }
                        if(wfOneNode.componentType === "SCRIPT"){
                            ntype = "sc";
                        }

                        var nodeData = {
                            "ntype":ntype,
                            "ntemplateid": wfOneNode.componentId,
                            "mtype":wfOneNode.componentId,
                            "mlabel":wfOneNode.name,
                            "fullData":wfOneNode
                        };
                        addNewNode(wfOneNode.xCoord,wfOneNode.yCoord,nodeData);
                    });
                    //render connectors
                    // suspend drawing and initialise.
                    jsp.batch(function () {
                        $.each(currentWfData.nodes, function(i, wfOneNode) {
                            var destNodeId = wfOneNode.id;
                            $.each(wfOneNode.incomingLinks, function(i, wfOneLink) {
                                var sourceNodeId = wfOneLink.sourceNodeId;
                                var toNode = "p_"+destNodeId+"_"+wfOneLink.output.id;
                                var fromNode = "p_"+sourceNodeId+"_"+wfOneLink.input.id;
                                console.log( "link:" + fromNode +" > "+ toNode);
                                jsp.connect({ source:fromNode, target:toNode, type:"basic" });
                            });
                        });
                    });
                    //set zoom and pan as saved
                    var matrix = pz.panzoom('getMatrix');
                    wfZoom = wfPlumbCanvasData.wf.zoom;
                    //fix unusable zoom
                    if (wfZoom === 0) wfZoom = 1;
                    matrix[0] = wfZoom;
                    matrix[3] = wfZoom;
                    matrix[4] = wfPlumbCanvasData.wf.xCoord;
                    matrix[5] = wfPlumbCanvasData.wf.yCoord;
                    pz.panzoom("setMatrix", matrix);

                    jsPlumb.fire("jsPlumbSetZoom", wfZoom);
                    wfPlumbCanvasData.loaded = true;
                    makeWFPreview();
                });
        })
        .fail(function () {
                alert("Could not retrive workflow data.", "ERROR");
        });
	};

	var addNewNode = function (x, y, dna) {
	    console.log("canvas: adding node: " + dna.mtype);
        if(!dna.ntemplateid) return 0;

        //creates canvas specific data and checks componente template before rendering node
	    dna.nodeID = jsPlumbUtil.uuid();
        dna.fullData.xCoord = x;
        dna.fullData.yCoord = y;
		if(dna.fullData.id === 0) {dna.fullData.id = dna.nodeID;}
		//recreate ntemplateid as tboid
        dna.ntemplateid = "tboid"+jsHashCode(dna.ntemplateid);

        //find node template from TOOLBOX and determine component type.
        var componentTemplate = null;
        if(dna.ntype === "pc"){
            if(wfPlumbCanvasData.nodeTemplates.pc[dna.ntemplateid]){
                if(wfPlumbCanvasData.nodeTemplates.pc[dna.ntemplateid]){
                    componentTemplate = wfPlumbCanvasData.nodeTemplates.pc[dna.ntemplateid].dna;
                }
            }
        }
        if(dna.ntype === "ds"){
            if(wfTools.toolboxnodes.ds[dna.ntemplateid]){
                if(wfPlumbCanvasData.nodeTemplates.ds[dna.ntemplateid]){
                    componentTemplate = wfPlumbCanvasData.nodeTemplates.ds[dna.ntemplateid].dna;
                }
            }
        }

        if(componentTemplate === null){
            console.log("comp template not found!!!!!!!!!!!!!!!!!!");
            //try to get component template from server,  usedComponents
            if(dna.ntype === "pc"){
                console.log("get "+ dna.mtype);

                var getProcessingComponentById = $.ajax({
                    cache: false,
                    url: baseRestApiURL + "component/list?id="+dna.mtype,
                    dataType : 'json',
                    type: 'GET',
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "X-Auth-Token": window.tokenKey
                    }
                });
                $.when(getProcessingComponentById)
                .done(function (getProcessingComponentByIdResponse) {
                    var pcData = chkTSRF(getProcessingComponentByIdResponse);
                    console.log("pc data:"); console.log(pcData);
                    if(pcData[0] && pcData[0].id && (pcData[0].id === dna.mtype)) {
                        //template returned, add to used pc, add template too
                        var hash = "tboid" + jsHashCode(dna.mtype);
                        componentTemplate = pcData[0];
                        wfPlumbCanvasData.usedComponents.push(dna.mtype);
                        wfPlumbCanvasData.nodeTemplates.pc[hash] = {
                            "dna": componentTemplate,
                            "id": hash,
                            "image": "./media/module-otb.png",
                            "label": "xxxxx",
                            "type": "component"
                        };
                    }
                    canvasRenderer.createNode(componentTemplate, dna);
                })
                .fail(function () {
                    alert("Could not retrive pc data.", "ERROR");
                    canvasRenderer.createNode(componentTemplate, dna);
                });
            }
            if(dna.ntype === "ds"){
                console.log("get "+ dna.mtype);

                var getDatasourceById = $.ajax({
                    cache: false,
                    url: baseRestApiURL + "datasource/list?id="+dna.mtype,
                    dataType : 'json',
                    type: 'GET',
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "X-Auth-Token": window.tokenKey
                    }
                });
                $.when(getDatasourceById)
                    .done(function (getDatasourceByIdResponse) {
                        var dsData = chkTSRF(getDatasourceByIdResponse);
                        console.log("ds data:"); console.log(dsData);
                        if(dsData[0] && dsData[0].id && (dsData[0].id === dna.mtype)) {
                            //template returned, add to used ds, add template too
                            var hash = "tboid" + jsHashCode(dna.mtype);
                            componentTemplate = dsData[0];
                            wfPlumbCanvasData.usedComponents.push(dna.mtype);
                            wfPlumbCanvasData.nodeTemplates.ds[hash] = {
                                "dna": componentTemplate,
                                "id": hash,
                                "image": "./media/module-otb.png",
                                "label": "xxxxx",
                                "type": "datasource"
                            };
                        }
                        canvasRenderer.createNode(componentTemplate, dna);
                    })
                    .fail(function () {
                        alert("Could not retrive pc data.", "ERROR");
                        canvasRenderer.createNode(componentTemplate, dna);
                    });
            }
        }else{
            canvasRenderer.createNode(componentTemplate, dna);
        }
	};



var canvasRenderer = {
    initPort: function(el, pType) {
        // initialise draggable elements.
        //window.jsp.draggable(el);
        if(pType === "out")
            window.jsp.makeSource(el, {
                filter: ".n-p-o",
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
        if(pType === "in")
            window.jsp.makeTarget(el, {
                dropOptions: { hoverClass: "dragHover" },
                anchor: "Continuous",
                allowLoopback: true
            });
        jsPlumb.fire("jsPlumbPortAdded", el);
    },
    createNode: function(componentTemplate, dna){
        if(componentTemplate === null){
            //set component template for unknown
            componentTemplate = {
                "id": "component-unavilable",
                "label": "Unknown",
                "version": "1.0",
                "description": "Component has been removed from toolbox",
                "authors": "SNAP Team",
                "copyright": "(C) SNAP Team",
                "nodeAffinity": "Any",
                "sources": [],
                "targets": [],
                "containerId": "3513b060dab3",
                "fileLocation": "",
                "workingDirectory": "",
                "templateType": "VELOCITY",
                "variables": [],
                "multiThread": true,
                "visibility": "SYSTEM",
                "active": true,
                "componentType": "EXECUTABLE",
                "owner": "SystemAccount",
                "parameterDescriptors": [],
                "templatecontents": ""
            };
            dna.ntype = "unknown";
        }



        var completeness = 0;
        var maxPorts = Math.max(componentTemplate.sources.length, componentTemplate.targets.length);
        var d = document.createElement("div");
        var innerHTML ="";
        innerHTML += "<div class=\"module-info\">";
        innerHTML += "<div class=\"module-animation\">";
        if(dna.ntype === "ds") {
            innerHTML += "<svg id=\"development_icon\" width=\"32\" height=\"32\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
                "  <g id=\"svg_1\">\n" +
                "   <path stroke=\"null\" id=\"svg_2\" d=\"m16.19351,7.43438c7.68001,0 13.29079,-1.37867 13.29079,-3.07952c0,-1.70024 -5.61016,-3.07952 -13.29079,-3.07952c-7.68125,0 -13.29141,1.37867 -13.29141,3.07952c0,1.70147 5.61016,3.07952 13.29141,3.07952z\" fill=\"#5c96bc\"/>\n" +
                "   <path stroke=\"null\" id=\"svg_3\" d=\"m2.32489,14.35052l0,6.70053c1.23205,1.03862 5.98409,2.30887 13.55322,2.30887c7.56851,0.00062 12.93596,-1.27025 13.55199,-2.30825l0,-6.70115c-2.46411,1.33493 -8.07119,2.02611 -13.55199,2.02611c-5.48141,0 -10.47308,-0.69118 -13.55322,-2.02611z\" fill=\"#5c96bc\"/>\n" +
                "   <path stroke=\"null\" id=\"svg_4\" d=\"m29.4301,22.43834c-2.46411,1.33493 -8.07119,2.0255 -13.55199,2.0255c-5.48141,0 -10.47308,-0.69057 -13.55322,-2.0255l0,5.27628c0,0.04066 -0.01355,0.08132 -0.01355,0.12259c0,0.04127 0.01355,0.08193 0.01355,0.12321l0,-0.16017l0.16879,0c0.82609,1.84808 6.32537,2.88054 13.63638,2.88054c7.3104,0 12.88976,-1.03246 13.45527,-2.88054l-0.15524,0l0,0.16017c0,-0.04066 0.01417,-0.08193 0.01417,-0.12259c0,-0.04127 -0.01417,-0.08193 -0.01417,-0.12259l0,-5.27689l0.00001,-0.00001z\" fill=\"#5c96bc\"/>\n" +
                "   <path stroke=\"null\" id=\"svg_5\" d=\"m29.4301,6.24483c-1.84808,1.46368 -7.90363,2.22201 -13.55199,2.22201c-5.64897,0 -11.08911,-0.75833 -13.55322,-2.22263l0,6.72024c1.23205,1.03801 5.98409,2.30825 13.55322,2.30825c7.56851,0 12.93596,-1.27025 13.55199,-2.30825l0,-6.71963l0,0.00001z\" fill=\"#5c96bc\"/>\n" +
                "  </g>\n" +
                "</svg>";
        }
        if(dna.ntype === "pc") {
            innerHTML += "<svg id=\"development_icon\" x=\"0px\" y=\"0px\" width=\"32px\" height=\"32px\"><path id=\"large-cog\" d=\"m13.331,1c-1.152,0.296 -2.248,0.712 -3.285,1.126c0.865,4.027 -2.535,5.329 -4.955,3.612c-0.922,0.652 -1.614,1.541 -1.902,2.785c2.535,1.716 1.268,6.275 -2.189,5.861c0,1.303 0,2.604 0,3.91c3.688,-0.357 4.494,4.204 2.189,6.157c0.635,0.947 0.922,2.252 2.189,2.547c2.189,-1.835 5.531,-0.178 4.667,3.613c1.038,0.414 2.132,0.83 3.284,1.124c0.463,-3.198 5.244,-3.198 5.763,0c1.153,-0.294 2.247,-0.71 3.286,-1.124c-0.864,-4.027 2.533,-5.332 4.955,-3.613c0.922,-0.65 1.61,-1.541 1.9,-2.784c-2.535,-1.716 -1.267,-6.275 2.19,-5.862c0,-1.302 0,-2.605 0,-3.908c-3.687,0.298 -4.495,-4.203 -2.19,-6.159c-0.635,-0.948 -0.865,-2.251 -2.189,-2.487c-2.191,1.836 -5.53,0.178 -4.666,-3.614c-1.039,-0.413 -2.133,-0.829 -3.286,-1.124c-0.806,3.256 -4.954,3.256 -5.761,-0.06zm8.586,15.398c0,3.196 -2.536,5.804 -5.705,5.804c-3.17,0 -5.705,-2.607 -5.705,-5.804c0,-3.197 2.535,-5.805 5.705,-5.805c3.17,-0.057 5.705,2.548 5.705,5.805z\" fill=\"#5c96bc\"/></svg>";
        }
        innerHTML += "</div>";

        innerHTML += "<div class=\"module-new\"></div>";
        if(dna.ntype === "unknown"){
            innerHTML += "<div class=\"module-title\">Component&nbsp;unavailable:<br>"+dna.mlabel+"</div>";
        }else{
            innerHTML += "<div class=\"module-title\">"+dna.mlabel+"</div>";
        }
        innerHTML += "<div class=\"module-subtitle\">"+dna.fullData.componentId+"</div>";
        innerHTML += "<div class=\"module-subtitle\">"+datetimeFromArray(dna.fullData.created)+"</div>";
        innerHTML += "</div>";
        innerHTML += "<div class=\"module-ports\">";
        for (i = 0; i < maxPorts; i++) {
            innerHTML += "<div class=\"module-ports-row\">";
            if(componentTemplate.targets[i]) innerHTML += "<div id=\"p_"+dna.fullData.id+"_"+componentTemplate.targets[i].id+"\" class=\"n-p-o-wrapp\"><div class=\"n-p-o\"></div><div class=\"l-n-p-o\"><i class=\"fa fa-sign-out\" aria-hidden=\"true\"></i>&nbsp;"+componentTemplate.targets[i].name+"</div></div>";
            if(componentTemplate.sources[i]) innerHTML += "<div id=\"p_"+dna.fullData.id+"_"+componentTemplate.sources[i].id+"\" class=\"n-p-i-wrapp\"><div class=\"n-p-i\"></div><div class=\"l-n-p-i\"><i class=\"fa fa-sign-in\" aria-hidden=\"true\"></i>&nbsp;"+componentTemplate.sources[i].name+"</div></div>";
            innerHTML += "</div>";
        }
        innerHTML += "<div class=\"module-status\">"+completeness+"% Completed</div>";
        innerHTML += "</div>";
        innerHTML += "<div class=\"module-middle\" title=\"RES\"><div class=\"module-icon csvType\">";
        innerHTML += "<svg width=\"40\" height=\"40\">";
        innerHTML += "<path id=\"arc1\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"12\" d=\""+describeArc(20, 20, 12, 0, completeness/100*360)+"\" />";
        innerHTML += "</svg>";
        innerHTML += "</div></div>";
        innerHTML += "<footer class=\"module-footer\">";
        innerHTML += "<div class=\"meta\"><button class=\"btn-transparent btn-action-erasemodule\"><i class=\"fa fa-trash\"></i><span class=\"sr-only\">Erase module</span></button></div>";
        if(dna.ntype !== "unknown") {
            innerHTML += "<div class=\"meta\"><button class=\"btn-transparent btn-action-editmodule\"><i class=\"fa fa-pencil\"></i><span class=\"sr-only\">Edit module</span></button></div>";
        }
        innerHTML += "</footer>";
//
        if(dna.ntype === "unknown"){
            d.className = "w unknown-w";
        }else{
            d.className = "w";
        }
        d.id = dna.nodeID;
        d.innerHTML = innerHTML;
        d.style.left = dna.fullData.xCoord + "px";
        d.style.top = dna.fullData.yCoord + "px";
        d.dataset.dna = JSON.stringify(dna); //Having to access dataset
        d.style.opacity = 0;
        d.onmousedown = function(){
            tao_adModuleToSelection(dna.nodeID);
        };
        window.jsp.getContainer().appendChild(d);
        $("#"+dna.nodeID).fadeTo( "slow" , .8, function() {});
        //add node to toolbox
        toolboxModules.newModule(dna);
        //init ports as jsplumb nodes
        for (i = 0; i < maxPorts; i++) {
            var elPort;
            if(componentTemplate.targets[i]) {
                elPort = document.getElementById("p_"+dna.fullData.id+"_"+componentTemplate.targets[i].id);
                this.initPort(elPort, "out");
                wfPlumbCanvasData.ports["p_"+dna.fullData.id+"_"+componentTemplate.targets[i].id] = {"type":"out", "parentID":dna.fullData.id, "fullData":componentTemplate.targets[i]};
            }
            if(componentTemplate.sources[i]) {
                elPort = document.getElementById("p_"+dna.fullData.id+"_"+componentTemplate.sources[i].id);
                this.initPort(elPort, "in");
                wfPlumbCanvasData.ports["p_"+dna.fullData.id+"_"+componentTemplate.sources[i].id] = {"type":"in", "parentID":dna.fullData.id, "fullData":componentTemplate.sources[i]};
            }
        }

        var elNB = document.getElementById(dna.nodeID);
        window.jsp.addGroup({
            el:elNB,
            id:"ng_"+dna.nodeID,
            constrain:true,
            anchor:"Continuous",
            endpoint:"Blank",
            droppable:false
        });

        //var elPort = document.getElementById("p-in-1-"+dna.nodeID); window.jsp.addToGroup("ng_"+dna.nodeID, elPort);

        //add nodes to workflow shadow data
        wfPlumbCanvasData.nodesMap[dna.nodeID] = dna.fullData.id;
        wfPlumbCanvasData.nodes[dna.nodeID] = dna.fullData;
        jsPlumb.fire("jsPlumbNodeAdded", d);
        return d;
    }
};
