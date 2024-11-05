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
	.on("mousedown", ".on-screen" ,function(e){
		// Save mouse coordinates
		$('#div-propbar-widget-app').data("targetCoord", { offsetX: e.offsetX, offsetY: e.offsetY });
	})
	.on("click", ".on-screen" ,function(e){
		if (e.target !== this) return;
		// Prevent closing propbar when false click is triggered while selecting a text
		var targetCoord = $('#div-propbar-widget-app').data("targetCoord");
		if (targetCoord.offsetX !== e.offsetX || targetCoord.offsetY !== e.offsetY) return;
		
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
            if($(this)[0].type == "date"){
                var endstring = $(this).siblings(".var-default").html().split("T")[1];
                $(this).siblings(".var-value").val($(this).val() + "T" + endstring);
            }
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
            if(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/.test($(this).html())){
                $(this).siblings(".var-value-string").val($(this).html().split("T")[0]);
            }else{
                $(this).siblings(".var-value-string").val($(this).html());
            }
            $(this).siblings(".var-value-string").trigger("change");
		}
		if ($(".var-value-list:visible", $(this).parent()).length > 0) {
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
                "X-Auth-Token": window.parent.tokenKey
            }
        });
        $.when(putOneQuery)
            .done(function (putOneComponentResponse) {
                if(putOneComponentResponse.hasOwnProperty('message') && putOneComponentResponse.message !== null){
                    alert(putOneComponentResponse.message);
                }else{
                    $(".v-lastaction","#infoband").html("query updated");
					// Also update node information if changed. Custom Values won't be overwritten
					saveProcessing();
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
            var selDataType = $(".var-dataType",$(this)).html();
            var hasValueset = $(".var-value-string",$(this)).parent().siblings("select").find("option").length;
            if(selDataType.indexOf("[]") !== -1 && hasValueset > 0){
                var value = $(".var-value-list",$(this)).val();
                if(value === "_null" || value === null){
                    value = null;
                }else{
                    value = "["+value+"]"; 
                }

                if(value !== null){
                    if(value.indexOf("[]") !== -1){
                        var move=value.indexOf("[]");
                        value = value.substring(move,move+2);
                    }
                }
               
                var onePair = {
                    "parameterName":$(".var-name",$(this)).html(),
                    "parameterValue":value,
                };
            }else if(selDataType.indexOf("[]") !== -1 && hasValueset == 0){
                var value = $(".var-value-string",$(this)).val();
                value = "["+value+"]";

                var onePair = {
                    "parameterName":$(".var-name",$(this)).html(),
                    "parameterValue":value,
                };
            }else{
                var onePair = {
                    "parameterName":$(".var-name",$(this)).html(),
                    "parameterValue":$(".var-value",$(this)).val()
                };
            }
            //Modification for template parameters
            if($(".var-parent-name",$(this)).html() !== null && $(".var-parent-name",$(this)).html() !== '' && typeof onePair !== "undefined"){
               onePair.parameterName = $(".var-parent-name",$(this)).html() +"~"+ onePair.parameterName;
            }
			var defaultVal = $(".var-default",$(this)).html();
            //if (onePair.parameterValue !== defaultVal && onePair.parameterValue !== "") {
            if (onePair.parameterValue !== defaultVal && (onePair.parameterValue !== "" || (onePair.parameterValue === "" && hasValueset > 0)) && $(".var-type",$(this)).html() !== "TEMPLATE") {
				cV.push(onePair);
			}
        });
        $propbar.nodeData.customValues = cV;
		$propbar.nodeData.name = $tblEdt.closest("app-modal").find(".val-propbar-name").html();
        var putOneComponent = $.ajax({
            cache: false,
            url: baseRestApiURL + "workflow/node?workflowId=" + currentWfID,
            dataType : 'json',
            type: 'PUT',
            data: JSON.stringify($propbar.nodeData),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Auth-Token": window.parent.tokenKey
            }
        });
        $.when(putOneComponent)
            .done(function (putOneComponentResponse) {
                if(putOneComponentResponse.status === "SUCCEEDED"){
                    $(".v-lastaction","#infoband").html("custom values updated");
                    wfPlumbCanvasData.nodes[$propbar.nid] = putOneComponentResponse.data;
					canvasRenderer.updateNodeById($propbar.nid, putOneComponentResponse.data);
                }else{
                    alert(putOneComponentResponse.message);
                }
            })
            .fail(function(jqXHR, status, textStatus){
                alert("Could not update custom values", "ERROR");
            });
    };

    function fieldFormat(){

		$(".tag-format").tagsInput({
			minChars	: 0,
			maxChars	: null,
			limit		: null,
			interactive	: true,
			autocomplete: null,
			unique		: true,
			placeholder	: 'Add an element',
			delimiter	: ','

		});

	}

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
    var topologyList;
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

        var getTopologyList = function(id){
            return $.ajax({
                cache: false,
                url: baseRestApiURL + "topology/available",
                dataType : 'json',
                type: 'GET',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "X-Auth-Token": window.parent.tokenKey
                }
            });
        }
        
        $.when(getTopologyList(lcl_n.id))
            .done(function(getTopologyResponse){
                console.log(getTopologyResponse);
                topologyList = getTopologyResponse.data;
            });

        if(lcl_n.componentType === "PROCESSING"){
            console.log(lcl_n);
            $propbar.ntype = "PROCESSING";
            backgroundURL = './media/module01.png';
			if(wfTools.toolboxnodes.pc[lclTBOID]){
                componentTemplate = wfPlumbCanvasData.nodeTemplates.pc[lclTBOID].dna;
                backgroundURL = "./media/"+componentTemplate.containerId+".png";
			}

            
            var getTokens = function(id){
                return $.ajax({
                    cache: false,
                    url: baseRestApiURL + "component/naming/find?nodeId="+id,
                    dataType : 'json',
                    type: 'GET',
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "X-Auth-Token": window.parent.tokenKey
                    }
                });
            };
            $.when(getTokens(lcl_n.id))
                .done(function (getTokensResponse) {
					var sourcesIndex = [];
                    function prepareTokens(dd){
                        var tags = [];
						var ddUniqueBySensor = dd.filter((v,i,a)=>a.findIndex(t=>(t.sensor === v.sensor))===i)
                        ddUniqueBySensor.forEach(function (d, idx) {
                            if(!jQuery.isEmptyObject(d.tokens)){
								sourcesIndex.push({"index":d.minIndex, "sensor":d.sensor})
                                Object.keys(d.tokens).sort().forEach(function (key) {
                                    tags.push({"key": key, "desc": d.tokens[key]+" - "+d.sensor, "range":{"minIndex": d.minIndex,"maxIndex": d.maxIndex}});
                                });
                            }
                        });
                        return tags;
                    }
                    var nodeTokens = prepareTokens(getTokensResponse.data);
                    wf_loadModuleProcessing(nid,lcl_n,componentTemplate,nodeTokens,sourcesIndex);
                })
                .fail(function () {
                    alert("Could not retrive query for current datasource.");
                });
        }
        if(lcl_n.componentType === "DATASOURCE"){
            $propbar.ntype = "DATASOURCE";
            backgroundURL = './media/module-ds.png';
			// data source component category is removed from toolbox (is linked with workspace.js wfTools.toolboxnodes.ds, app.js wfTools.datasources commented zones)
           /* if(wfTools.toolboxnodes.ds[lclTBOID]){
                componentTemplate = wfTools.toolboxnodes.ds[lclTBOID].dna;
            } else */if (wfTools.toolboxnodes.uds[lclTBOID]) {
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
                "X-Auth-Token": window.parent.tokenKey
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
	var wf_loadModuleProcessing = function(nid,lcl_n,componentTemplate,nodeTokens,sourcesIndex){
        var html_details = "";
        var $tbl;

        html_details +="<span>version: "+componentTemplate.version+"</span><br>";
        html_details +="<span>description: "+componentTemplate.description+"</span><br>";
        html_details +="<span>authors: "+componentTemplate.authors+"</span><br>";
        html_details +="<span>copyright: "+componentTemplate.copyright+"</span><br>";
        html_details +="<span>affinity: "+componentTemplate.nodeAffinity+"</span><br>";
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
                if((currentCustomValueSet.parameterValue ==="[]" || currentCustomValueSet.parameterValue ==="" ) && valueset!== null){
                    value = null;
                }else{
                    value = currentCustomValueSet.parameterValue;
                }
            }

            if ((valueset === null) || (valueset.length === 0) || ((valueset.length === 1) && ((valueset[0] === "") || (valueset[0] === "null")))) {
                $('input.var-value', $el).val(value);
                if( name === "password" && type.indexOf("[]") == -1 ){
                    $('input.var-value-string', $el).attr("type", "password");
                    $('input.var-value-string', $el).css("width","100%");
                    $('i.glyphicon-eye-open', $el).css("display", "inline");
                }
                if( type.indexOf("[]") > -1){ 
                    $('input.var-value-string', $el).addClass("tag-format");
                    if(value !== null && value!== "") {
                        $('input.var-value', $el).val(value.substring(1, value.length-1));
                        $('input.var-value-string', $el).val(value.substring(1, value.length-1)).show();
                    }    
                }else if (type === "date") {
                    $('input.var-value-string', $el).attr("type", "date");
                    if(value != null){
                        $('input.var-value-string', $el).val(value.split("T")[0]).show();
                    }else{
                        $('input.var-value-string', $el).show();
                    }
                } else {
                    if ((type === "int") || (type === "long") || (type === "double") || (type === "short") || (type === "float") || (type === "number")) {
                        $('input.var-value-string', $el).attr("type", "number");
                    }
                    $('input.var-value-string', $el).val(value).show();
                }
                fieldFormat();
            } else {
                $('input.var-value', $el).val(value);
                var html = "";
                html += "<option class='empty-option' value='"+(type.indexOf("[]") > -1 ? null : "")+"'>Empty value</option>";
                $.each(valueset, function(i, v) {
                    html +="<option "+(v === value && 'selected ')+"value=\""+v+"\">"+v+"</option>";
                });
                $('select.var-value-list', $el).append(html);
                $('select.var-value-list', $el).html(html).show();


                if (type.indexOf("[]") > -1) {
                    $('select.var-value-list', $el).attr("id",name);
                    $('select.var-value-list', $el).removeClass("collapse");
                    $('select.var-value-list', $el).removeClass("form-control");
                    $('select.var-value-list', $el).prop("multiple","multiple")
                    $select = $('select.var-value-list', $el);
                    $parent = $select.parent();

                    $select.select2({ placeholder: "Select item..."  , width: "100%", allowClear: true, dropdownParent: $parent});
                    if(value === null || value === "" || value.length === 0){
                        $('#keywordselect').val(null);
                        $('.select2-selection__rendered').html('');
                    }

                    if(value === null){
                        $('select.var-value-list', $el).val(value);
                        $('select.var-value-list', $el).trigger("change");
                    }else if( value !== null ){
                        var valArray = value.substring(1, value.length-1);
                        valArray = valArray.split(",");
                        $('select.var-value-list', $el).val(valArray);
                        $('select.var-value-list', $el).trigger("change");
                    }     
                }    
            } 
                  
        };
        var helper_addSTblEdtRow = function($tblEdt, payload, objParent){
            var obj = {
                "dataType": "string",
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
                "value": null,
                "parameters": []
            };
            $.extend( obj, payload );
           
            var $el = $tblEdt.find(".tpl-sample-row").clone().addClass("val-row").removeClass("tpl-sample-row");
            $('span.var-id', $el).html(obj.id);
            $('span.var-name', $el).html(obj.name);
            $('span.var-label', $el).html(obj.label);
            $('span.var-type', $el).html(obj.type);
            $('span.var-description', $el).html(obj.description);
            $('span.var-dataType', $el).html(obj.dataType);
            
            if(obj.defaultValue !== ''){
                $('span.var-default', $el).html(obj.defaultValue);
            }else{
                $('#show-var-def', $el).addClass('collapse');
            }

            if(obj.dataType === "bool"){
                if(obj.value === null){
                    helper_putValue($el, obj.name, obj.dataType, obj.defaultValue, ["true","false"]);
                }else{
                    helper_putValue($el, obj.name, obj.dataType, obj.value, ["true","false"]);
                }
            }else{
                helper_putValue($el, obj.name, obj.dataType, obj.value, obj.valueSet);
            }

            if(obj.type === "TEMPLATE"){
                $el.find(".textviewWrapper ").removeClass(".textviewWrapper ");
                $(".div-params", $el).css("display","none");
            }

            if(typeof objParent === "undefined"){
                $tblEdt.append($el);
            } else {
                $('span.var-parent-id', $el).html(objParent.id);
                $('span.var-parent-name', $el).html(objParent.name);
                objParent.container.append($el);
            } 

            if(obj.parameters[0] !== undefined){
                $el.find("td").append('<table class="tbl-extra-param"><tbody></tbody></table>');
                $.each(obj.parameters, function(i,param){
                    obj.container = $(".tbl-extra-param>tbody", $el);
                    helper_addSTblEdtRow($tblEdt, param, obj);
                });
            }

            fieldFormat();
            return $el;
        };
        /////////////////////////////////
        if (typeof lcl_n.additionalInfo != 'undefined') {
            lcl_n.additionalInfo.forEach(element => {
                var obj = {
                    "label": element.parameterName,
                    "description": element.parameterName,
                    "dataType": "string",
                    "defaultValue": element.parameterValue,
                    "required": true,
                    "valueSet": topologyList,
                    "value": element.parameterValue,
                    "name": element.parameterName
                };
                helper_addSTblEdtRow($("#tbl-edt-sysvar"), obj);
            });
        }
		
        // Parse parameters
		/*$.each(componentTemplate.parameterDescriptors, function(i, value) {
            helper_addSTblEdtRow($("#tbl-edt-sysvar"),value);
        });*/
        $.each(componentTemplate.parameterDescriptors, function(i, parameter) {
            if(parameter.dataType === "string" && parameter.valueSet[0] === "null" && parameter.type !== "TEMPLATE"){
                var value = {
					id          : parameter.id,
                    dataType    : parameter.dataType,
                    defaultValue: "",
                    description : parameter.description,
					name        : parameter.name,
					label       : parameter.label,
                    notNull     : parameter.notNull,
					type        : parameter.type,
					valueSet    : parameter.valueSet,
                    parameters  : parameter.parameters
                    
				};
                var elValue = helper_addSTblEdtRow($("#tbl-edt-sysvar"), value);
                var elFilename = $('.var-value-string', elValue)[0];
                var elValueVal = $('.var-value', elValue)[0];
                console.log(nodeTokens);
                //call filename plugin on element
                $(elFilename).npFileName({
                    tags: nodeTokens,
                    output: elValueVal,
                    submitOnEnter: false,
                    debug: true,
					sourcesIndex: sourcesIndex
                });
                
            } else {
                helper_addSTblEdtRow($("#tbl-edt-sysvar"),parameter);
            }
        });

        // Parse targets
		$.each(componentTemplate.targets, function(i, target) {
			if ((wfTools.isOldVersion && typeof target.dataDescriptor !== "undefined") || !wfTools.isOldVersion) {
				var value = {
					id          : target.id,
					name        : target.name,
					label       : target.name,
					defaultValue: wfTools.isOldVersion ? target.dataDescriptor.location : target.location,
					description : "Output parameter",
					valueSet    : [ "null" ]
				};
				var elTarget = helper_addSTblEdtRow($("#tbl-edt-sysvar"), value);
                var elFilename = $('.var-value-string', elTarget)[0];
                var elValue = $('.var-value', elTarget)[0];
				console.log(nodeTokens);
                //call filename plugin on element
                $(elFilename).npFileName({
                    tags: nodeTokens,
                    output: elValue,
                    submitOnEnter: false,
                    debug: true,
					sourcesIndex: sourcesIndex
                });
			}
        });
        if(componentTemplate.parameterDescriptors.length > 0 || lcl_n.additionalInfo.length > 0) $tblEdt.closest(".app-card").show();
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
            if ((valueset == null) || (valueset.length === 0) || ((valueset.length === 1) && ((valueset[0] === "") || (valueset[0] === "null")))) {
				if (type === "date") {
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
				} else if ((type === "int") || (type === "long") || (type === "double") || (type === "short") || (type === "float") || (type === "number")) {
					$('input.var-value-string', $el).attr("type", "number");
                } else if (type === "polygon") {
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
                "type": "REGULAR",
                "dataType": "string",
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
            $('span.var-name', $el).html(obj.name);
            $('span.var-label', $el).html(obj.name);
            $('span.var-description', $el).html( (obj.required?"required":"not required") );
            $('span.var-dataType', $el).html(obj.dataType);
            $('span.var-default', $el).html(obj.defaultValue);
			
            if (obj.dataType === "bool") {
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
