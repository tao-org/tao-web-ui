var $propbar = {notify:{e:10,f:-4},zindex:500,nid:null,nodeData:null};

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
    .on("change",".var-value-string",function(e){
        $(this).siblings(".var-value").val($(this).val());
    })
    .on("change",".var-value-list",function(e){
        $(this).siblings(".var-value").val($(this).val());
    })
    .on("click", "#update-custum-values",function(e){
        e.preventDefault();
        var cV = [];
        $tblEdt = $("#tbl-edt-sysvar");
        $tblEdt.find(".val-row").each(function() {
            var onePair = {
                "parameterName":$(".var-id",$(this)).html(),
                "parameterValue":$(".var-value",$(this)).val()
            };
            cV.push(onePair);
        });
        $propbar.nodeData.customValues = cV;
        var putOneComponent = $.ajax({ cache: false,
            url: baseRestApiURL + "workflow/node?workflowId=" + currentWfID,
            dataType : 'json',
            type: 'PUT',
            data: JSON.stringify($propbar.nodeData),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": authHeader
            }
        });
        $.when(putOneComponent)
            .done(function (putOneComponentResponse) {
                if(putOneComponentResponse.hasOwnProperty('message')){
                    alert(putOneComponentResponse.message);
                }else{
                    $(".v-lastaction","#infoband").html("custom values updated");
                    wfPlumbCanvasData.nodes[$propbar.nid] = putOneComponentResponse;
                }
            })
            .fail(function(){
                alert("Could udate custom values", "ERROR");
            });
    });



	
	window.$propbar.menu = function(action, params){
						if ( action === "open") {
							$('html, body').addClass("app-noscroll");
							propbar_remderNodeForm(params.nodeid);
							$('app-modal-overlay').addClass("on-screen");
						}
						if ( action === "close") {
							$('app-modal-overlay').removeClass("on-screen");
							$('html, body').removeClass("app-noscroll");
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
        if(lcl_n.componentType === "DATASOURCE"){backgroundURL = './media/module-ds.png';}
        if(lcl_n.componentType === "PROCESSING"){backgroundURL = './media/module-otb.png';}
        //$('.app-user-avatar-img',widgetRootEl).css('background-image', 'url('+backgroundURL+')');
        $('.app-user-avatar-img',widgetRootEl).attr('src', backgroundURL);

        var lclTBOID = "tboid"+jsHashCode(lcl_n.componentId);
        var componentTemplate = null;
        var queryTemplate = null;

        if(lcl_n.componentType === "PROCESSING"){
			if(wfTools.toolboxnodes.pc[lclTBOID]){
				componentTemplate = wfTools.toolboxnodes.pc[lclTBOID].dna;
			}
            wf_loadModuleProcessing(nid,lcl_n,componentTemplate);
        }
        if(lcl_n.componentType === "DATASOURCE"){
            if(wfTools.toolboxnodes.ds[lclTBOID]){
                componentTemplate = wfTools.toolboxnodes.ds[lclTBOID].dna;
            }
            if(wfTools.toolboxnodes.q[lclTBOID]){
                queryTemplate = wfTools.toolboxnodes.q[lclTBOID].dna;
            }
            wf_loadModuleDatasource(nid,lcl_n,componentTemplate,queryTemplate);
        }
        if(componentTemplate === null){
            console.log("comp template not found!!!!!!!!!!!!!!!!!!");
        }
        console.log("Template:");
        $(".app-debug", widgetRootEl).html("<pre>"+JSON.stringify(componentTemplate, null, 4)+"</pre><pre>"+JSON.stringify(queryTemplate, null, 4)+"</pre>");

    };

	var wf_loadModuleDatasource = function(nid,lcl_n,componentTemplate,queryTemplate){
        var html_details = "";
        html_details +="<span>version: "+componentTemplate.version+"</span><br>";
        html_details +="<span>description: "+componentTemplate.description+"</span><br>";
        html_details +="<span>authors: "+componentTemplate.authors+"</span><br>";
        html_details +="<span>copyright: "+componentTemplate.copyright+"</span><br>";
        $(".val-propbar-details", widgetRootEl).html(html_details);

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

        var helper_putValue = function($el, name, value, valueset){

            var currentCustomValueSet = (_.find($propbar.nodeData.customValues, function(item) {
                return (item.parameterName === name);
            }));
            //console.log("value:"+value+"current"+currentCustomValueSet.parameterValue);
            if(currentCustomValueSet && currentCustomValueSet.hasOwnProperty('parameterValue')){
                value = currentCustomValueSet.parameterValue;
            }

            if((valueset.length === 1) && ( valueset[0] === "")){
                $('input.var-value', $el).val(value);
                $('input.var-value-string', $el).val(value).show();
            }else{
                $('input.var-value', $el).val(value);
                var html = "";
                $.each(valueset, function(i, v) {
                    html +="<option "+(v === value && 'selected ')+"value=\""+v+"\">"+v+"</option>";
                });
                $('select.var-value-list', $el).html(html).show();
            }
        //<option value="java.lang.String">String</option>

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
            $('span.var-label', $el).html(obj.label);
            $('span.var-description', $el).html(obj.description);
            $('span.var-dataType', $el).html(humanJavaDataType(obj.dataType));
            $('span.var-default', $el).html(obj.defaultValue);
            if((obj.value == null) || (obj.value === '') || (obj.value === undefined)){
                obj.value = obj.defaultValue;
            }
            if(obj.dataType === "java.lang.Boolean"){
                helper_putValue($el, obj.id, obj.value, ["true","false"]);
            }else{
                helper_putValue($el, obj.id, obj.value, obj.valueSet);
            }
            $tblEdt.append($el);
        };
        $.each(componentTemplate.parameterDescriptors, function(i, value) {
            console.log(value);
            helper_addSTblEdtRow($("#tbl-edt-sysvar"),value);
        });
        if(componentTemplate.parameterDescriptors.length > 0) $tblEdt.closest(".app-card").show();

	    return 1;
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
