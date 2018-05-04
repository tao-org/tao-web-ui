    var wfPlumbCanvasData = {
        _remote:{
            response:null
        },
        header:{
            id:0,
            name:"No name",
            status:"",
            username:"",
            visibility:""
        },
        nodes:[],
        nodesMap:{},
        groups:[],
        connectors:[],
        position:{
            x:0,
            y:0
        },
        zoom:1,
        prefs:{
            conn_style:0
        }
    };

    var wf_removeAllNodes = function(){
		//todo: alert for delete all
        console.log("f:wf_removeAllNodes");
		$(".w", $elCanvas).addClass("selected");
        toolboxModules.rescanSelected();
        toolboxModules.rmSelected();
    };
	var wf_loadWorkflowById = function(wfId){
        console.log("f:wf_loadWorkflowById , load workflow"+wfId);
        var getWorkflowById = $.ajax({ cache: false,
            url: baseRestApiURL + "workflow/"+wfId+"/?rnd=" + Math.random(),
            dataType : 'json',
            type: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": authHeader
            }
        });
        $.when(getWorkflowById)
        .done(function (getWorkflowByIdResponse) {
            wfPlumbCanvasData._remote = getWorkflowByIdResponse;
            wfPlumbCanvasData.header.id = getWorkflowByIdResponse.id;
            wfPlumbCanvasData.header.name = getWorkflowByIdResponse.name;
            wfPlumbCanvasData.header.status = getWorkflowByIdResponse.status;
            wfPlumbCanvasData.header.username = getWorkflowByIdResponse.userName;
            wfPlumbCanvasData.header.visibility = getWorkflowByIdResponse.visibility;
            //render workflow header
            toolboxHeader.populate(wfPlumbCanvasData.header).open();

            console.log(getWorkflowByIdResponse);
                //$('#inputContainerId').empty();
                wfNodes = [];
                wfNodesMap = {};
                //render nodes
                $.each(getWorkflowByIdResponse.nodes, function(i, wfOneNode) {
                    console.log(wfOneNode);
                    var nodeData = {
                        "ntype":"pc",
                        "ntemplateid": "tboid"+jsHashCode(wfOneNode.componentId),
                        "mtype":wfOneNode.componentId,
                        "mlabel":wfOneNode.name,"fullData":wfOneNode
                    };
                    addNewNode(wfOneNode.xCoord,wfOneNode.yCoord,nodeData);
                });
                //render connectors

            // suspend drawing and initialise.
            jsp.batch(function () {
                $.each(getWorkflowByIdResponse.nodes, function(i, wfOneNode) {
                    var destNodeId = wfOneNode.id;
                    $.each(wfOneNode.incomingLinks, function(i, wfOneLink) {
                        var sourceNodeId = wfOneLink.sourceNodeId;
                        var toNode = "p-"+destNodeId+"-"+wfOneLink.output.id;
                        var fromNode = "p-"+sourceNodeId+"-"+wfOneLink.input.id;
                        console.log( "link:" + fromNode +" > "+ toNode);
                        jsp.connect({ source:fromNode, target:toNode, type:"basic" });
                    });
                });
            });
                makeWFPreview();
        })
        .fail(function () {
                showMsg("Could not retrive workflow data.", "ERROR");
        });
	};

	var addNewNode = function (x, y, dna) {
		dna.nodeID = jsPlumbUtil.uuid();
		if(dna.fullData.id === 0) {dna.fullData.id = dna.nodeID;}
        if(!dna.ntemplateid){
		    return 0;
        }
        //find node template from TOOLBOX
        var componentTemplate = null;
        if(dna.ntype === "pc"){
            if(wfTools.toolboxnodes.pc[dna.ntemplateid]){
                componentTemplate = wfTools.toolboxnodes.pc[dna.ntemplateid].dna;
            }
        }
        if(dna.ntype === "ds"){
            if(wfTools.toolboxnodes.ds[dna.ntemplateid]){
                componentTemplate = wfTools.toolboxnodes.ds[dna.ntemplateid].dna;
            }
        }

        if(componentTemplate === null){
            console.log("comp template not found!!!!!!!!!!!!!!!!!!");
            return 0;
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
        innerHTML += "<div class=\"module-title\">"+dna.mlabel+"</div>";
        innerHTML += "<div class=\"module-subtitle\">"+dna.fullData.componentId+"</div>";
        innerHTML += "<div class=\"module-subtitle\">"+datetimeFromArray(dna.fullData.created)+"</div>";
        innerHTML += "</div>";
        innerHTML += "<div class=\"module-ports\">";
        for (i = 0; i < maxPorts; i++) {
            innerHTML += "<div class=\"module-ports-row\">";
            if(componentTemplate.targets[i]) innerHTML += "<div id=\"p-"+dna.fullData.id+"-"+componentTemplate.targets[i].id+"\" class=\"n-p-o-wrapp\"><div class=\"n-p-o\"></div></div>";
            if(componentTemplate.sources[i]) innerHTML += "<div id=\"p-"+dna.fullData.id+"-"+componentTemplate.sources[i].id+"\" class=\"n-p-i-wrapp\"><div class=\"n-p-i\"></div></div>";
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
        innerHTML += "<div class=\"meta\"><button class=\"btn-transparent btn-action-editmodule\"><i class=\"fa fa-pencil\"></i><span class=\"sr-only\">Edit module</span></button></div>";
        innerHTML += "</footer>";
//
        d.className = "w";
        d.id = dna.nodeID;
        d.innerHTML = innerHTML;
        d.style.left = x + "px";
        d.style.top = y + "px";
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
                elPort = document.getElementById("p-"+dna.fullData.id+"-"+componentTemplate.targets[i].id);
                initPort(elPort, "out");
            }
            if(componentTemplate.sources[i]) {
                elPort = document.getElementById("p-"+dna.fullData.id+"-"+componentTemplate.sources[i].id);
                initPort(elPort, "in");
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

        //var elPort = document.getElementById("p-in-1-"+dna.nodeID);
        //window.jsp.addToGroup("ng_"+dna.nodeID, elPort);
        //add nodes to workflow shadow data
//        wfNodes.push(d);
//        wfNodesMap[d.id] = d;
        return d;
	};
	
	var initPort = function(el, pType) {
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
    };
