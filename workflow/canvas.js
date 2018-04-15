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
                console.log(getWorkflowByIdResponse);
                //$('#inputContainerId').empty();
                wfNodes = [];
                wfNodesMap = {};
                //render nodes
                $.each(getWorkflowByIdResponse.nodes, function(i, wfOneNode) {
                    console.log(wfOneNode);
                    var tmp_node = addNewNode(wfOneNode.xCoord,wfOneNode.yCoord,{"mtype":wfOneNode.componentId,"mlabel":wfOneNode.name,"fullData":wfOneNode});
                    wfNodes.push(tmp_node);
                    wfNodesMap[wfOneNode.id] = tmp_node;
                });
                //render connectors
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
                makeWFPreview();
        })
        .fail(function () {
                showMsg("Could not retrive workflow data.", "ERROR");
        });

	}

	var addNewNode = function (x, y, dna) {
			dna.nodeID = jsPlumbUtil.uuid();
			if(dna.fullData.id == 0) {dna.fullData.id = dna.nodeID;}

            //find node template from tools->componets
            componentTemplate = $.grep(wfTools.components, function(el, idx){return el.id !== dna.fullData.componentId;},true);
            console.log("comp template, dna:"); console.log(componentTemplate); console.log(dna);
            if(!componentTemplate[0]){
                console.log("comp template not found!!!!!!!!!!!!!!!!!!");
                return 0;
            }

        var completeness = 0;
        var maxPorts = Math.max(componentTemplate[0].sources.length, componentTemplate[0].targets.length);
        var d = document.createElement("div");
        var innerHTML ="";

        innerHTML += "<div class=\"module-info\">";
        innerHTML += "<div class=\"module-animation\">";
        innerHTML += "<svg id=\"development_icon\" x=\"0px\" y=\"0px\" width=\"32px\" height=\"32px\"><path id=\"large-cog\" d=\"m13.331,1c-1.152,0.296 -2.248,0.712 -3.285,1.126c0.865,4.027 -2.535,5.329 -4.955,3.612c-0.922,0.652 -1.614,1.541 -1.902,2.785c2.535,1.716 1.268,6.275 -2.189,5.861c0,1.303 0,2.604 0,3.91c3.688,-0.357 4.494,4.204 2.189,6.157c0.635,0.947 0.922,2.252 2.189,2.547c2.189,-1.835 5.531,-0.178 4.667,3.613c1.038,0.414 2.132,0.83 3.284,1.124c0.463,-3.198 5.244,-3.198 5.763,0c1.153,-0.294 2.247,-0.71 3.286,-1.124c-0.864,-4.027 2.533,-5.332 4.955,-3.613c0.922,-0.65 1.61,-1.541 1.9,-2.784c-2.535,-1.716 -1.267,-6.275 2.19,-5.862c0,-1.302 0,-2.605 0,-3.908c-3.687,0.298 -4.495,-4.203 -2.19,-6.159c-0.635,-0.948 -0.865,-2.251 -2.189,-2.487c-2.191,1.836 -5.53,0.178 -4.666,-3.614c-1.039,-0.413 -2.133,-0.829 -3.286,-1.124c-0.806,3.256 -4.954,3.256 -5.761,-0.06zm8.586,15.398c0,3.196 -2.536,5.804 -5.705,5.804c-3.17,0 -5.705,-2.607 -5.705,-5.804c0,-3.197 2.535,-5.805 5.705,-5.805c3.17,-0.057 5.705,2.548 5.705,5.805z\" fill=\"#5c96bc\"/></svg>";
        innerHTML += "</div>";
        innerHTML += "<div class=\"module-new\"></div>";
        innerHTML += "<div class=\"module-title\">"+dna.mlabel+"</div>";
        innerHTML += "<div class=\"module-subtitle\">"+dna.fullData.componentId+"</div>";
        innerHTML += "<div class=\"module-subtitle\">"+datetimeFromArray(dna.fullData.created)+"</div>";
        innerHTML += "</div>";
        innerHTML += "<div class=\"module-ports\">";
        for (i = 0; i < maxPorts; i++) {
            innerHTML += "<div class=\"module-ports-row\">";

//            if(componentTemplate[0].sources[i]) innerHTML += "<div id=\"p-"+dna.fullData.id+"-"+componentTemplate[0].sources[i].id+"\" class=\"n-p-o-wrapp\"><div class=\"n-p-o\"></div></div>";
//            if(componentTemplate[0].targets[i]) innerHTML += "<div id=\"p-"+dna.fullData.id+"-"+componentTemplate[0].targets[i].id+"\" class=\"n-p-i-wrapp\"><div class=\"n-p-i\"></div></div>";

            if(componentTemplate[0].targets[i]) innerHTML += "<div id=\"p-"+dna.fullData.id+"-"+componentTemplate[0].targets[i].id+"\" class=\"n-p-o-wrapp\"><div class=\"n-p-o\"></div></div>";
            if(componentTemplate[0].sources[i]) innerHTML += "<div id=\"p-"+dna.fullData.id+"-"+componentTemplate[0].sources[i].id+"\" class=\"n-p-i-wrapp\"><div class=\"n-p-i\"></div></div>";
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
            if(componentTemplate[0].targets[i]) {
                var elPort = document.getElementById("p-"+dna.fullData.id+"-"+componentTemplate[0].targets[i].id);
                initPort(elPort, "out");
            }
            if(componentTemplate[0].sources[i]) {
                var elPort = document.getElementById("p-"+dna.fullData.id+"-"+componentTemplate[0].sources[i].id);
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

        // this is not part of the core demo functionality; it is a means for the Toolkit edition's wrapped version of this demo to find out about new nodes being added.
        window.jsp.fire("jsPlumbDemoNodeAdded", el);
    };

	