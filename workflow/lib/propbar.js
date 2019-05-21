var $propbar = {notify:{e:10,f:-4},zindex:500,nid:null,ntype:null,nodeData:null,qData:null};

(function () {
	var holdingElement = document.createElement('div');
	holdingElement.id = "div-propbar-widget-app";
	if($propbar.zindex)
		holdingElement.style.zIndex = $propbar.zindex+1;
	document.body.appendChild(holdingElement);
	var widgetRootEl = $('#div-propbar-widget-app');

	$(widgetRootEl)
	.on("click", ".app-dismiss" ,function(){
		$propbar.menu("close");
	})
	.on("click", ".on-screen" ,function(e){
		if (event.target !== this) return;
		$propbar.menu("close");
	})
    .on("click", ".tbl-prop-expand-action", function(e){
        e.preventDefault();
        if($(this).hasClass("active")){
            $(".val-row-plus").css({"display": "none"});
            $(this).removeClass("active");
            return;
        }
        $(".val-row-plus").css({"display": "none"});
        $(".tbl-prop-expand-action").removeClass("active");
        $(this).addClass("active");
        $(this).closest("tr").next().css({"display": "table-row"});
    })
    .on("change",".var-value-string, .var-value-string2, .var-value-list",function(e){
        if ($(".var-value-string2:visible", $(this).parent()).length > 0) {
			var d1 = $(".var-value-string" , $(this).parent()).val();
			var d2 = $(".var-value-string2", $(this).parent()).val();
			var ds = (d1.length > 0 && d2.length > 0) ? "[" + d1 + "," + d2 + "]" : (d1.length > 0 ? d1 : d2);
			$(this).siblings(".var-value").val(ds);
		} else {
			$(this).siblings(".var-value").val($(this).val());
		}
    })
    .on("click", "#update-custum-values",function(e){
        e.preventDefault();
        if($propbar.ntype === "PROCESSING"){
            saveProcessing();
        }
        if($propbar.ntype === "DATASOURCE"){
            saveQuery();
        }
        window.$propbar.menu("close");
    })
	.on("click", ".ol", function (e) {
		// Load map poly
		var $mapContainer   = $("#propbarMap");
		var $footprintField = $(this).parent().find("input.var-value-string");
		openPolygonMap($mapContainer, $footprintField);
	})
    .on("click", ".var-default",function(e){
		if ($(".var-value-string:visible", $(this).parent()).length > 0) {
			$(this).siblings(".var-value-string").val($(this).html());
			$(this).siblings(".var-value-string").trigger("change");
		} else if ($(".var-value-list:visible", $(this).parent()).length > 0) {
			$(this).siblings(".var-value-list").val($(this).html());
			$(this).siblings(".var-value-list").trigger("change");
		}
	});

    var saveQuery = function(){
        var cV = {};
        $tblEdt = $("#tbl-edt-sysvar");
        $tblEdt.find(".val-row").each(function() {
            var k = $(".var-id",$(this)).html();
            cV[k] = $(".var-value",$(this)).val();
        });
        $propbar.qData.values = cV;
        $propbar.qData.user = $('input[name=qusername]', widgetRootEl).val();
        $propbar.qData.password = $('input[name=qpassword]', widgetRootEl).val();

        $propbar.qData.pageNumber = $('input[name=qpagenumber]', widgetRootEl).val();
        $propbar.qData.pageSize = $('input[name=qpagesize]', widgetRootEl).val();
        $propbar.qData.limit = $('input[name=qlimit]', widgetRootEl).val();

        var method = 'PUT';
        if($propbar.qData.id === null){
            method = 'POST';
        }
        var putOneQuery = $.ajax({
            cache: false,
            url: baseRestApiURL + "datasource/query/",
            dataType : 'json',
            type: method,
            data: JSON.stringify($propbar.qData),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Auth-Token": window.tokenKey
            }
        });
        $.when(putOneQuery)
            .done(function (putOneComponentResponse) {
                if(putOneComponentResponse.hasOwnProperty('message') && putOneComponentResponse.message !== null){
                    alert(putOneComponentResponse.message);
                }else{
                    $(".v-lastaction","#infoband").html("query updated");
                }
            })
            .fail(function(){
                alert("Could not udate query object", "ERROR");
            });
    };

    var saveProcessing = function(){
        var cV = [];
        $tblEdt = $("#tbl-edt-sysvar");
        $tblEdt.find(".val-row").each(function() {
            var onePair = {
                "parameterName":$(".var-name",$(this)).html(),
                "parameterValue":$(".var-value",$(this)).val()
            };
			var defaultVal = $(".var-default",$(this)).html();
            if (onePair.parameterValue != defaultVal) {
				cV.push(onePair);
			}
        });
        $propbar.nodeData.customValues = cV;
        var putOneComponent = $.ajax({
            cache: false,
            url: baseRestApiURL + "workflow/node?workflowId=" + currentWfID,
            dataType : 'json',
            type: 'PUT',
            data: JSON.stringify($propbar.nodeData),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Auth-Token": window.tokenKey
            }
        });
        $.when(putOneComponent)
            .done(function (putOneComponentResponse) {
                if(putOneComponentResponse.status === "SUCCEEDED"){
                    $(".v-lastaction","#infoband").html("custom values updated");
                    wfPlumbCanvasData.nodes[$propbar.nid] = putOneComponentResponse.data;
                }else{
                    alert(putOneComponentResponse.message);
                }
            })
            .fail(function(){
                alert("Could udate custom values", "ERROR");
            });
    };

	window.$propbar.menu = function(action, params){
						if ( action === "open") {
							$('html, body').addClass("app-noscroll");
							propbar_remderNodeForm(params.nodeid);
							$('app-modal-overlay').addClass("on-screen");
						}
						if ( action === "close") {
							closePolygonMap();
							$('app-modal-overlay').removeClass("on-screen");
							$('html, body').removeClass("app-noscroll");
                            widgetRootEl.find(".app-card-clean").hide();
						}
	};
	var propbar_remderNodeForm = function(nid){
        widgetRootEl.find(".tbl-edt").closest(".app-card").hide();
	    widgetRootEl.find(".val-row").remove();
        $propbar.nid = nid;
	    var lcl_n = $propbar.nodeData = wfPlumbCanvasData.nodes[nid];
        $(".val-propbar-name", widgetRootEl).html(lcl_n.name);
        $(".val-propbar-componentid", widgetRootEl).html(lcl_n.componentId);
        var backgroundURL = '';
        //$('.app-user-avatar-img',widgetRootEl).css('background-image', 'url('+backgroundURL+')');


        var lclTBOID = "tboid"+jsHashCode(lcl_n.componentId);
        var componentTemplate = null;
        var queryTemplate = null;

        if(lcl_n.componentType === "PROCESSING"){
            $propbar.ntype = "PROCESSING";
            backgroundURL = './media/module01.png';
			if(wfTools.toolboxnodes.pc[lclTBOID]){
				//componentTemplate = wfTools.toolboxnodes.pc[lclTBOID].dna;
                componentTemplate = wfPlumbCanvasData.nodeTemplates.pc[lclTBOID].dna;
                backgroundURL = "./media/"+componentTemplate.containerId+".png";
			}
            wf_loadModuleProcessing(nid,lcl_n,componentTemplate);
        }
        if(lcl_n.componentType === "DATASOURCE"){
            $propbar.ntype = "DATASOURCE";
            backgroundURL = './media/module-ds.png';
            if(wfTools.toolboxnodes.ds[lclTBOID]){
                componentTemplate = wfTools.toolboxnodes.ds[lclTBOID].dna;
            } else if (wfTools.toolboxnodes.uds[lclTBOID]) {
                componentTemplate = wfTools.toolboxnodes.uds[lclTBOID].dna;
            }
            if(wfTools.toolboxnodes.q[lclTBOID]){
                queryTemplate = wfTools.toolboxnodes.q[lclTBOID].dna;
            }
			if (componentTemplate || queryTemplate) {
				wf_loadModuleDatasource(nid,lcl_n,componentTemplate, queryTemplate);
			} else {
				alert("Component template not found.");
			}
        }
        $('.app-user-avatar-img',widgetRootEl).attr('src', backgroundURL);

        if(componentTemplate === null){
            console.log("comp template not found!!!!!!!!!!!!!!!!!!");
        }
        //console.log("Template:");
        //$(".app-debug", widgetRootEl).html("<pre>"+JSON.stringify(componentTemplate, null, 4)+"</pre><pre>"+JSON.stringify(queryTemplate, null, 4)+"</pre>");

    };

	var wf_loadModuleDatasource = function(nid,lcl_n,componentTemplate,queryTemplate){
        //to do user propagation
	    var user = "admin";
	    var html_details = "";
        html_details +="<span>version: "+componentTemplate.version+"</span><br>";
        html_details +="<span>description: "+componentTemplate.description+"</span><br>";
        html_details +="<span>authors: "+componentTemplate.authors+"</span><br>";
        html_details +="<span>copyright: "+componentTemplate.copyright+"</span><br>";
        $(".val-propbar-details", widgetRootEl).html(html_details);
        //get current query
        var dsId = wfPlumbCanvasData.nodesMap[nid];
        var getQBody = $.ajax({
            cache: false,
            url: baseRestApiURL + "datasource/query/?userId=admin&nodeId=" + dsId,
            dataType : 'json',
            type: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Auth-Token": window.tokenKey
            }
        });
        $.when(getQBody)
            .done(function (getQBodyResponse) {
                if (getQBodyResponse.status === "SUCCEEDED") {
					renderQForm(getQBodyResponse.data[0], queryTemplate);
				} else {
					alert("Could not retrive query for current datasource.");
				}
            })
            .fail(function () {
                alert("Could not retrive query for current datasource.");
            });
    };
	var wf_loadModuleProcessing = function(nid,lcl_n,componentTemplate){
        var html_details = "";
        var $tbl;

        html_details +="<span>version: "+componentTemplate.version+"</span><br>";
        html_details +="<span>description: "+componentTemplate.description+"</span><br>";
        html_details +="<span>authors: "+componentTemplate.authors+"</span><br>";
        html_details +="<span>copyright: "+componentTemplate.copyright+"</span><br>";
        $(".val-propbar-details", widgetRootEl).html(html_details);

        //load system vars
        $tblEdt = $("#tbl-edt-sysvar");
        $tblEdt.find(".val-row").remove();

        var helper_putValue = function($el, name, type, value, valueset){

            var currentCustomValueSet = (_.find($propbar.nodeData.customValues, function(item) {
                return (item.parameterName === name);
            }));
            //console.log("value:"+value+"current"+currentCustomValueSet.parameterValue);
            if(currentCustomValueSet && currentCustomValueSet.hasOwnProperty('parameterValue')){
                value = currentCustomValueSet.parameterValue;
            }

            if((valueset.length === 1) && (( valueset[0] === "") || ( valueset[0] === "null"))){
                $('input.var-value', $el).val(value);
                if(humanJavaDataType(type) === "Date"){
                    $('input.var-value-string', $el).attr("type", "date");
                }
                if((humanJavaDataType(type) === "Double") || (humanJavaDataType(type) === "Short") || (humanJavaDataType(type) === "Float") || (humanJavaDataType(type) === "Number")){
                    $('input.var-value-string', $el).attr("type", "number");
                }
                $('input.var-value-string', $el).val(value).show();
            }else{
                $('input.var-value', $el).val(value);
                var html = "";
                $.each(valueset, function(i, v) {
                    html +="<option "+(v === value && 'selected ')+"value=\""+v+"\">"+v+"</option>";
                });
                $('select.var-value-list', $el).html(html).show();
            }
        };
        var helper_addSTblEdtRow = function($tblEdt, payload){
            var obj = {
                "dataType": "java.lang.String",
                "defaultValue": "",
                "description": "",
                "format": null,
                "id": "",
                "label": "",
                "notNull": false,
                "type": "REGULAR",
                "unit":null,
                "validator":null,
                "valueSet": [],
                "value": null
            };
            $.extend( obj, payload );
            var $el = $tblEdt.find(".tpl-sample-row").clone().addClass("val-row").removeClass("tpl-sample-row");
            $('span.var-id', $el).html(obj.id);
            $('span.var-name', $el).html(obj.name);
            $('span.var-label', $el).html(obj.label);
            $('span.var-description', $el).html(obj.description);
            $('span.var-dataType', $el).html(humanJavaDataType(obj.dataType));
            $('span.var-default', $el).html(obj.defaultValue);
            if((obj.value == null) || (obj.value === '') || (obj.value === undefined)){
                obj.value = obj.defaultValue;
            }
            if(obj.dataType === "java.lang.Boolean"){
                helper_putValue($el, obj.name, obj.dataType, obj.value, ["true","false"]);
            }else{
                helper_putValue($el, obj.name, obj.dataType, obj.value, obj.valueSet);
            }
            $tblEdt.append($el);
        };
		
        // Parse parameters
		$.each(componentTemplate.parameterDescriptors, function(i, value) {
            helper_addSTblEdtRow($("#tbl-edt-sysvar"),value);
        });
		
        // Parse targets
		$.each(componentTemplate.targets, function(i, target) {
			if (typeof target.dataDescriptor !== "undefined") {
				var value = {
					id          : target.id,
					name        : target.name,
					label       : target.name,
					defaultValue: target.dataDescriptor.location,
					description : "Output parameter",
					valueSet    : [ "null" ]
				}
				helper_addSTblEdtRow($("#tbl-edt-sysvar"), value);
			}
        });
		
        if(componentTemplate.parameterDescriptors.length > 0) $tblEdt.closest(".app-card").show();

	    return 1;
	};


	var renderQForm = function(qBody,queryTemplate){
	    if (!queryTemplate) return;
		
		$("#qbody").show();
	    if(!qBody){
	        qBody = {
                "id": null,
                "userId": "admin",
                "workflowNodeId": $propbar.nodeData.id,
                "sensor": queryTemplate.sensor,
                "dataSource": queryTemplate.dataSourceName,
                "user": null,
                "password": null,
                "pageSize": 10,
                "pageNumber": 1,
                "limit": 2,
                "values": {}
            }
        }


        $propbar.qData = qBody;
        $('input[name=qusername]', widgetRootEl).val(qBody.user);
        $('input[name=qpassword]', widgetRootEl).val(qBody.password);

        $('input[name=qpagenumber]', widgetRootEl).val(qBody.pageNumber);
        $('input[name=qpagesize]', widgetRootEl).val(qBody.pageSize);
        $('input[name=qlimit]', widgetRootEl).val(qBody.limit);

        //load system vars
        $tblEdt = $("#tbl-edt-sysvar");
        $tblEdt.find(".val-row").remove();

        var helper_putValue = function($el, name, type, value, valueset){
			$('input.var-value', $el).val(value);
            if ((valueset.length === 1) && (( valueset[0] === "") || ( valueset[0] === "null"))) {
				if (humanJavaDataType(type) === "Date") {
					$('input.var-value-string', $el).attr("type", "date").css({ "width": "30%", "margin-right": "2%" });
					if (name.toLowerCase() === "startdate" || name.toLowerCase() === "enddate") {
						// double field
						$('input.var-value-string', $el).clone().toggleClass("var-value-string var-value-string2").insertAfter($('input.var-value-string', $el));
						var date1 = "";
						var date2 = "";
						if (value !== null) {
							var match = value.match(/^\[(.*),(.*)\]$/);
							date1 = match ? match[1] : value;
							date2 = match ? match[2] : "";
						}
						value = date1;
						$('input.var-value-string2', $el).val(date2).show();
					} else {
						// single field
						$('input.var-value-string', $el).attr("type", "date").css({ "width": "30%" });
					}
				} else if (humanJavaDataType(type) === "Double" || humanJavaDataType(type) === "Short" || humanJavaDataType(type) === "Float" || humanJavaDataType(type) === "Number") {
					$('input.var-value-string', $el).attr("type", "number");
                } else if (humanJavaDataType(type) === "Polygon2D") {
					// Add button to open polygon map
					$("<i class='fa fa-fw fa-globe ol' style='position:absolute;font-size:1.5em;vertical-align:bottom;color:#2677a7;cursor:pointer;margin-left:-25px;margin-top:2px;background-color:white;'></i>").insertAfter($('input.var-value-string', $el));
				}
				$('input.var-value-string', $el).val(value).show();
            } else {
                var html = "";
				html += "<option value=''></option>";
                $.each(valueset, function (i, v) {
					html += "<option " + (v.toUpperCase() === value.toUpperCase() ? "selected " : "") + "value='" + v.toUpperCase() + "'>" + v + "</option>";
                });
                $('select.var-value-list', $el).html(html).show();
            }
        };
        var helper_addSTblEdtRow = function($tblEdt, payload){
            var obj = {
                "name": null,
                "type": "java.lang.String",
                "dataType": "java.lang.String",
                "defaultValue": null,
                "required": false,
				"valueSet": [],
				"value": null
            };
            $.extend(obj, payload);
			obj.dataType = obj.type;
			obj.value = $propbar.qData.values[obj.name] || "";
			obj.valueSet = obj.valueSet || [ "null" ];
			
            var $el = $tblEdt.find(".tpl-sample-row").clone().addClass("val-row").removeClass("tpl-sample-row");
            $('span.var-id', $el).html(obj.name);
            $('span.var-label', $el).html(obj.name);
            $('span.var-description', $el).html( (obj.required?"required":"not required") );
            $('span.var-dataType', $el).html(humanJavaDataType(obj.dataType).replace(";", "[]"));
            $('span.var-default', $el).html(obj.defaultValue);
			
            if (humanJavaDataType(obj.dataType) === "Boolean") {
				obj.valueSet = [ "true", "false" ];
			}
			helper_putValue($el, obj.name, obj.dataType, obj.value, obj.valueSet);
            $tblEdt.append($el);
        };
        $.each(queryTemplate.parameters, function(i, value) {
            helper_addSTblEdtRow($("#tbl-edt-sysvar"),value);
        });
        if(_.size(queryTemplate.parameters) > 0) $tblEdt.closest(".app-card").show();

    };



	var wf_loadPropbarWidget = function(){
        var getWBody = $.ajax({ cache: false,
            url: "./propbar.content.html",
            dataType : 'html',
            type: 'GET',
			xhrFields: { withCredentials: true }
        });
		$widgetEl = widgetRootEl;
        $.when(getWBody)
        .done(function (getWBodyResponse) {
                //render widget content
				if (getWBodyResponse) {
						$widgetEl.empty().append(getWBodyResponse);
                }else{
					$widgetEl.empty();	
				}
        })
        .fail(function () {
				$widgetEl.empty();
                alert("Could not retrive widget data.");
        });
	};
    wf_loadPropbarWidget();
}());
