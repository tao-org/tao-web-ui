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
        var lcl_n = wfPlumbCanvasData.nodes[nid];
        console.log(lcl_n);
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
        }
        if(lcl_n.componentType === "DATASOURCE"){
            if(wfTools.toolboxnodes.ds[lclTBOID]){
                componentTemplate = wfTools.toolboxnodes.ds[lclTBOID].dna;
            }
            if(wfTools.toolboxnodes.q[lclTBOID]){
                queryTemplate = wfTools.toolboxnodes.q[lclTBOID].dna;
            }
        }
        if(componentTemplate === null){
            console.log("comp template not found!!!!!!!!!!!!!!!!!!");
        }
        console.log("Template:");
        $(".app-debug", widgetRootEl).html("<pre>"+JSON.stringify(componentTemplate, null, 4)+"</pre><pre>"+JSON.stringify(queryTemplate, null, 4)+"</pre>");

    };

	var wf_loadModule = function(action){
        var getTHeadlines = $.ajax({ cache: false,
            url: "API/",
            dataType : 'json',
            type: 'GET',
			xhrFields: { withCredentials: true }
        });
        $.when(getTHeadlines)
        .done(function (getTHeadlinesResponse) {
                //render widget content
				if ((getTHeadlinesResponse.status == "ok") && (getTHeadlinesResponse.totalResults > 0)) {
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
				//to do
				//wf_loadModule();
        })
        .fail(function () {
				$widgetEl.empty();
                alert("Could not retrive widget data.");
        });
	};
    wf_loadPropbarWidget();
}());
