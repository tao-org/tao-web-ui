var $propbar = {notify:{e:10,f:-4},api:5,zindex:500};

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
	.on("submit", "form.l-form" ,function(e){
		e.preventDefault();
		e.stopPropagation();
		var postdata = "step=pass&input="+$("input[name=username]", ".l-form").val()+"&input2="+$("input[name=new-password]", ".l-form").val();
		var postUser = $.ajax({
			cache: false,
            url: "x/?rnd=" + Math.random(),
            //dataType : 'json',
            data: postdata,
			type: 'POST',
			xhrFields: { withCredentials: true }
        });
		$.when(postUser)
			.done(function (postUserResponse) {
					try{
						var obj = JSON.parse(postUserResponse);
					}catch(error){
                        alert("operation failed!");
						return 0;
					}
					if ((obj.code === "200-OK") && (obj.msgcode === "")) {
						//to to
					}else{
                        alert("operation failed!");
					}
			})
			.fail(function () {
                alert("operation failed!");
			});
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

	    var lcl_n = wfPlumbCanvasData.nodes[nid];
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
        $tbl = $("#tbl-edt-sysvar");
        $tbl.find(".val-row").remove();

        var helper_addSysVarRow = function($tbl, payload){
            var obj = {"key":"","value":""};
            $.extend( obj, payload );
            var $el = $tbl.find(".tpl-sample-row").clone().addClass("val-row").removeClass("tpl-sample-row");
            $('input.var-key', $el).val(obj.key);
            $('input.var-value', $el).val(obj.value);
            $tbl.append($el);
        };
        $.each(componentTemplate.variables, function(i, value) {
            helper_addSysVarRow($("#tbl-edt-sysvar"),value);
        });
        if(componentTemplate.variables.length > 0) $tbl.closest(".app-card").show();

        //load param descriptors
        $tbl = $("#tbl-edt-paramdesc");
        $tbl.find(".val-row").remove();
        var helper_addParameterDescriptorsRow = function($tbl, payload){
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
                "valueSet": []
            };
            $.extend( obj, payload );

            var $el = $tbl.find(".tpl-sample-body").clone().removeClass("tpl-sample-body");
            $el.find(".tpl-sample-row").addClass("val-row").removeClass("tpl-sample-row");
            $('input.var-id', $el).val(obj.id);
            $('textarea.var-description', $el).val(obj.description);
            $('input.var-label', $el).val(obj.label);
            $('input.var-default', $el).val(obj.defaultValue);

            $('select.var-type option', $el).removeAttr("selected");
            $('select.var-type option[value="'+obj.dataType+'"]', $el).attr("selected", "selected");

            $('select.var-datatype option', $el).removeAttr("selected");
            $('select.var-datatype option[value="'+obj.type+'"]', $el).attr("selected", "selected");

            $('input.var-unit', $el).val(obj.unit);
            if(obj.format) $('input.var-format', $el).val(obj.format);
            if(obj.validator) $('input.var-validator', $el).val(obj.validator);
            $tbl.append($el);
        };


        $.each(componentTemplate.parameterDescriptors, function(i, value) {
            helper_addParameterDescriptorsRow($("#tbl-edt-paramdesc"),value);
        });
        if(componentTemplate.parameterDescriptors.length > 0) $tbl.closest(".app-card").show();

	    return 1;



        var getTHeadlines = $.ajax({ cache: false,
            url: "API/",
            dataType : 'json',
            type: 'GET',
			xhrFields: { withCredentials: true }
        });
        $.when(getTHeadlines)
        .done(function (getTHeadlinesResponse) {
                //render widget content
				if ((getTHeadlinesResponse.status === "ok") && (getTHeadlinesResponse.totalResults > 0)) {
						console.log(getTHeadlinesResponse);
					var html = 'cucu';
					var $holderACHL = $("#app-card-head-lines");
					$holderACHL.find('app-card-note-item').remove();
					$holderACHL.append(html);
                }
        })
        .fail(function () {
                console.log("Could not retrive t h.");
        });
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
