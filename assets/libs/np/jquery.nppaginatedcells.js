/*!
 * npNotificationsPanels jQuery plugin
 *
 * it only applies to a single DOM element and options must include end-point url
 * creates paginated cell view, grid or list
 *
 * Copyright  CS ROMANIA, http://c-s.ro
 *
 * Licensed under the ....;
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

jQuery.fn.npPaginatedCells = function(options){
    var selectedObjects = this;
    var $selectedEl = $(this[0]);
    var $body = $('.nppaginatedcells-panel-body', $selectedEl);
    var $pagination = $('.nppaginatedcells-panel-pagination', $selectedEl);
    var $cellTemplateGrid = $( ".cell-templates core-cell-grid", $selectedEl);
    var $cellTemplateList = $( ".cell-templates core-cell-list", $selectedEl);
    var $searchBox = $(".search-box",$selectedEl);
    var $like = $(".like",$selectedEl);
    var $clearSearch = $(".clear-search",$selectedEl);
    var $tags = $(".tags",$selectedEl);

    var $valItemFrom = $(".val-itemfrom",$selectedEl);
    var $valItemTo = $(".val-itemto",$selectedEl);
    var $valItemCount = $(".val-itemscount",$selectedEl);
    var $valCountFilters = $(".val-count-filters",$selectedEl);
    var $emptyMsg = $(".nppaginatedcells-empty",$selectedEl);
    var $refreshNotification = $(".box-notification",$selectedEl);
    var $searchForm = $("form.search-container",$selectedEl);
    var $orderEl =  $(".nppaginatedcells-order",$selectedEl);

	

    var settings = $.extend({
        itemsOnPage: 8,
        url: '',
        order:[],
        filterAttribute: "",
        viewMode: "list",
        doAction: function (actionName) {},
        doDataPreprocessing: function(data){return data;},
        doCustomRender: function($el, data){return;},
		doDataPostprocessing : function(){return;}
    }, options );


    var dataPagination = {
        directPagesNo: 3,
        itemsOnPage: settings.itemsOnPage,
        currentPage: 0
    };
	var orderIndex = Math.max.apply(Math, $.merge([-1], $.map(settings.order, function (o, i) { return o.selected || o.default ? i : null; })));
    var dataFilter = {
        selectedTags: [],
        searchString: ""
    };
    var dataAllTags = [];

    var data = [];
    var dataFull = [];
	
    var getFromEndpoint = function(){
        var req = [];
        for (var j = 0; j < settings.url.length; j++){
            var getDataAjax = $.ajax({
                cache: false,
                url: settings.url[j],
                dataType : 'json',
                type: 'GET',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "X-Auth-Token": window.tokenKey
                }
            });
            req.push(getDataAjax);
        }
		contentLoading("show");
        $.when.apply($, req).done(function(){
            var retData = [];
            if(req.length === 1){
                retData = arguments[0].data;
            }
            if(req.length > 1){
                var response = [];
                for (var i = 0; i < req.length; i++){
                    response = $.merge(response,arguments[i][0].data);
                }
                retData = response;
            }
            retData = settings.doDataPreprocessing(retData);
			
			var currentPage = $("section.content-header").find("li.active")[0].textContent.toLowerCase();
			if (currentPage.indexOf("workflows") >= 0) {
				var action = $("a[data-toggle='tab'][aria-expanded='true']", ".nav-tabs-custom").attr("data-action");
				var active = false;
				var system = false;
				if (action === "active_nodes" || action === "system_nodes") {
					active = true;
				}
				
				if (action === "system_nodes"){
					system = true;
				}
				
				dataFull = retData.filter(function(item){
					if (system && item.visibility.toLowerCase() === "system") {
							return item;
					} else if (!system && item.visibility.toLowerCase() !== "system") {
						if(typeof item.active !== "undefined" && item.active === active) {
							return item;
						} else if (typeof item.active === "undefined") {
							return item;
						}
					}
				});
			} else {
				dataFull = retData;
			}
			
			
            if( (orderIndex === -1) && (settings.order.length>0) ){
                orderIndex = 0;
            }
            if(orderIndex !== -1){
                repaintOrder();
                changeOrder();
            }
            dataAllTags = [];
            for (var j = 0; j < dataFull.length; j++){
                if(dataFull[j].tags!=null){
                    dataAllTags = _.union(dataAllTags,dataFull[j].tags);
                }
            }
            dataAllTags.sort();
            repaintTags();
            repaintSearchBox();
            //console.log("data loaded");
            repaint();
        }).fail(function(jqXHR, textStatus, errorThrown) {
			routeLoading('hide');
			chkXHR(jqXHR.status);
        });

/*
        $.when(req[0])
            .done(function (getDataAjaxResponse) {
                data = getDataAjaxResponse.data;
                dataFull = getDataAjaxResponse.data;
                if( (orderIndex === -1) && (settings.order.length>0) ){
                    orderIndex = 0;
                }
                if(orderIndex !== -1){
                    repaintOrder();
                    changeOrder();
                }
                dataAllTags = [];
                for (var j = 0; j < dataFull.length; j++){
                    if(dataFull[j].tags!=null){
                        dataAllTags = _.union(dataAllTags,dataFull[j].tags);
                    }
                }
                dataAllTags.sort();
                repaintTags();
                repaintSearchBox();
                console.log("data loaded");
                repaint();
            })
            .fail(function () {
                alert("Plugin: Could not retrive data.");
            });
*/
    };

    var clearCells = function() {
        $body.empty();
    };
    var renderCells = function() {
        var visibleRange = {
            first: dataPagination.currentPage * dataPagination.itemsOnPage,
            last: dataPagination.currentPage* dataPagination.itemsOnPage+dataPagination.itemsOnPage
        };
        $valItemFrom.html( ((visibleRange.first+1 < data.length))? visibleRange.first+1 : data.length);
        $valItemTo.html( ((visibleRange.last < data.length))? visibleRange.last : data.length);
        $valItemCount.html(data.length);
		
        $.each(data, function( index, value ) {
            if((index >= visibleRange.first) && (index < visibleRange.last)){
                drawCell(index, value);
            }
        });
        //console.log("rendered");
		settings.doDataPostprocessing();
    };
    var drawCell = function(index, elX) {
        var elID = guid();
        var $elClone;
        var tags = "";
        if(settings.viewMode ==="grid"){
            $elClone = $cellTemplateGrid.clone();
        }else{
            $elClone = $cellTemplateList.clone();
        }
		
		// for system workflow keep only clone and execute buttons
		if (routeTags[1] === "workflows" && $("a[data-action='system_nodes']").length && $("a[data-action='system_nodes']").parent().hasClass("active")) {
			$("button",$elClone).not("[data-action='wf-clone'], [data-action='wf-start']").remove();
		}
        //iterate values and populate all inner html of val-propname with value of propname.
        //call custom cell alterations
        for (var property in elX) {
            if (elX.hasOwnProperty(property)) {
                $(".val-"+property, $elClone).html(elX[property]);
                if(property === 'description'){
                    $(".val-"+property, $elClone).prop('title',''+elX[property]+'');
                }
				if (property === "online") {
					$(".fa.fa-circle", $elClone).addClass(elX[property] ? "online": "offline");
				}
            }
        }
        if(elX.tags != null){
            for (var j = 0; j < elX.tags.length; j++){
                tags+="<span>"+elX.tags[j]+"</span>";
            }
        }
        $(".box-top-tags", $elClone).html(tags);
        $elClone.addClass("node-root").hide();
		$elClone.prop("id", "node-"+elID ).appendTo( $body ).data("dna", elX);
		var currentPage = $("section.content-header").find("li.active")[0].textContent.toLowerCase();//workaround for inherited active property
        if(elX.active === false && currentPage.toLowerCase() !== "remote services"){
            $elClone.addClass("disabled");
        }
        //render custom
        settings.doCustomRender($elClone, elX);
        $elClone.fadeIn('slow');
    };
//show/hide/append ui elements based on dataset and configuration
    var repaintSearchBox = function(){
        if((settings.filterAttribute === undefined) || (settings.filterAttribute === '')){
            $searchForm.hide();
        }else{
            $searchForm.show();
        }
    };

    var repaintTags = function(){
        $tags.empty();
        if(dataAllTags.length === 0 ){
            $tags.append('<p>No tags to show.</p>');
        }
        for (var j = 0; j < dataAllTags.length; j++){
            $tags.append('<span class="'+ (( $.inArray(dataAllTags[j], dataFilter.selectedTags)>=0) ? "selected" : "") +'" data-tag="'+dataAllTags[j]+'">'+dataAllTags[j]+'<i class="selected-hidden fa fa-square-o fa-fw" aria-hidden="true"></i><i class="selected-shown fa fa-check-square-o fa-fw" aria-hidden="true"></i></span>');
        }
    };
    var repaintOrder = function(){
        html = "<label for=\"npOrderIndex\">Order:&nbsp;</label><select id=\"npOrderIndex\" name=\"npOrderIndex\" class=\"\">\n";
        for (var j = 0; j < settings.order.length; j++){
            html += '<option value="'+j+'"'+((orderIndex === j) ?' selected="selected"':'')+'>'+settings.order[j]["label"]+'</option>';
        }
        html += "</select>";
        $orderEl.empty().append(html).show();
    };
    var repaintPagination = function(){
        var tP = Math.ceil(parseFloat(data.length/dataPagination.itemsOnPage) || 0);
        if((dataPagination.currentPage >= tP) || isNaN(dataPagination.currentPage) || (dataPagination.currentPage<0)){
            dataPagination.currentPage = 0;
        }
        var fP = dataPagination.currentPage - dataPagination.directPagesNo;
        var lP = dataPagination.currentPage + dataPagination.directPagesNo;
        $pagination.hide().empty();

        if (tP>1){
            //append previous
            if(dataPagination.currentPage>0){
                $pagination.append('<li><a href="#" data-page="'+(dataPagination.currentPage-1)+'">«</a></li>');
            }
            if(fP >= 0){
                $pagination.append('<li class="disabled"><span>...</span></li>');
            }else{
                fP = 0;
            }
            //append pages handlers
            for(i = fP; ((i <= lP) && (i < tP)); i++) {
                $pagination.append('<li class="'+((i === dataPagination.currentPage) ? 'active' : '')+'"><a href="#" data-page="'+i+'">'+(i+1)+'</a></li>');
            }
            if(lP <= tP){
                $pagination.append('<li class="disabled"><span>...</span></li>');
            }
            //append next
            if((dataPagination.currentPage+1)<tP) {
                $pagination.append('<li><a href="#" data-page="'+(dataPagination.currentPage+1)+'">»</a></li>');
            }
            $pagination.show();
        }
    };

    var refreshSearchUI = function(){
        var q = $searchBox.val();
        if(q === ""){
            $like.hide("fast");
        } else{
            $like.show("fast");
            $(".val-q", $like).html(q);
        }
    };

    var filterData = function(){
        dataFilter.searchString = $searchBox.val();
        data = [];
        dataFilter.selectedTags = [];
        $("span.selected",$tags).each(function() {
            dataFilter.selectedTags.push($(this).data('tag'));
        });
        //filter by tags
        for (var j = 0; j < dataFull.length; j++){
            var tagsIntersecttion  = -1;
            if(dataFull[j].tags != null){
                tagsIntersecttion = arrayIntersection(dataFilter.selectedTags,dataFull[j].tags);
            }
            if ((dataFilter.selectedTags.length === 0) || (tagsIntersecttion.length>0)){
                data.push(dataFull[j]);
            }
        }
        //filter by text
        if (dataFilter.searchString !== ''){
            var re = new RegExp(dataFilter.searchString, 'i');
            data = $.map(data,function(val,key){
                //if( val.label.match(re) ) return val;
                if( val[settings.filterAttribute].match(re) ) return val;
            });
        }
        //show empty results warning
        refreshEmptyWarning();
    };
    var refreshEmptyWarning = function(){
        //show empty results warning
        if(dataFull.length>0){
            $emptyMsg.find(".results-empty").hide();
            $emptyMsg.find(".filter-results-empty").show();
        }else{
            $emptyMsg.find(".results-empty").show();
            $emptyMsg.find(".filter-results-empty").hide();
        }
        if(data.length<1){
            $emptyMsg.show();
        } else{
            $emptyMsg.hide();
        }
    };
    var repaint = function(){
		contentLoading('hide');
        ui_showRefreshNotification();
        filterData();
        clearCells();
        repaintPagination();
        renderCells();
    };
    var ui_showRefreshNotification = function(){
        $refreshNotification.addClass("show");
        setTimeout(function(){
            $refreshNotification.removeClass("show");
        }, 3000);
    };

    var changeOrder = function(){
        var objAttribute = settings.order[orderIndex]["objAttributeName"];
        var direction = settings.order[orderIndex]["direction"];
        if((direction === undefined) && (direction !== "ASC") && (direction !== "DSC")){
            direction = "ASC";
        }
        function compare(a,b) {
            if(a[objAttribute] && b[objAttribute]){
                return a[objAttribute].localeCompare(b[objAttribute]);
            }else{
                return 0;
            }
        }
        dataFull.sort(compare);
        if(direction === "DSC"){
            dataFull.reverse();
        }
    };

    //add events handlers
    $searchForm.on("submit",function(e){
        e.preventDefault(e);
    });

    $orderEl
        .on("change", 'select' ,function(){
            orderIndex = parseInt(this.value);
            dataPagination.currentPage = 0;
           // getFromEndpoint();
		   repaintOrder();
		   changeOrder();
		   repaint();
        });

    $selectedEl
        .on("click", '.btn-master-tool', function(event){
            event.preventDefault();
            var action = $(this).data("action");
            if(action === "op-filter"){
                if( $tags.is(":visible") ){
                    $tags.hide("fast");
                }else{
                    $tags.show("fast");
                }
            }
            if(action === "view-list"){
        
                var username = _settings.readCookie("TaoUserName");
                var pageName = routeTags[0] +'-'+ routeTags[1];
                $.when(_userPref.getUserPreferences(username))
                .done(function(responseProfile){
                    var r = responseProfile.data;
                    currentPref = r.preferences;
                });
                var changed = false;
                $.each(currentPref, function(index,value){
                    keyValue = value.key;
                    if(keyValue.includes(pageName) === true){
                        if(value.value !== "list"){
                            //update the value with "list" 
                            value.value = "list";
                            changed = true;

                        } else if(value.value === "list"){
                            changed = true;
                        } 
                    }
                });
                if(!changed){
                    //add to preferences the new page with the value list
                    currentPref.push({"key": "view_mode_"+pageName, "value": "list"});
                }
                var updatePref = JSON.stringify(currentPref);
                _userPref.updateUserPreferences(updatePref);
            
                prefferences.viewMode = "list";
                settings.viewMode = "list";
                repaint();
            }
            if(action === "view-table"){
                
                var username = _settings.readCookie("TaoUserName");
                var pageName = routeTags[0] +'-'+ routeTags[1];
                $.when(_userPref.getUserPreferences(username))
                .done(function(responseProfile){
                    var r = responseProfile.data;
                    currentPref = r.preferences;
                });
                var changed = false;
                $.each(currentPref, function(index,value){
                    keyValue = value.key;
                    if(keyValue.includes(pageName) === true){
                        if(value.value !== "grid"){
                            //update the value with "list" 
                            value.value = "grid";
                            changed = true;
                            
                        } else if(value.value === "grid"){
                            changed = true;
                        } 
                    }
                });
                if(!changed){
                    //add to preferences the new page with the value grid
                    currentPref.push({"key": "view_mode_"+pageName, "value": "grid"});
                }
                var updatePref = JSON.stringify(currentPref);
                _userPref.updateUserPreferences(updatePref);
                
                prefferences.viewMode = "grid";
                settings.viewMode = "grid";
                repaint();
            }
            if(action === "refresh-list"){
                getFromEndpoint();
            }
            settings.doAction(action);
        })
        .on("click", ".btn-nodeop", function(event){
            event.preventDefault();
            var action = $(this).data("action");
            var $root = $(this).closest(".node-root");
            var dna = $root.data("dna");
            var args = {"dna":dna};
            settings.doAction(action,args);
        });
    $pagination
        .on('click', "li a", function(e){
            e.preventDefault();
            dataPagination.currentPage = $(this).data("page");
            repaint();
        });
    $searchBox
        .on('keyup', function(e){
            refreshSearchUI();
            repaint();
        });
    $clearSearch
        .on("click", function(e){
            $searchBox.val("");
            refreshSearchUI();
            repaint();
        });
    $tags
        .on('click', 'span', function (e) {
            $(this).toggleClass("selected");
            var cST = $('span.selected',$tags).length;
            $valCountFilters.html(cST);
            if(cST>0){
                $valCountFilters.show("fast");
            }else{
                $valCountFilters.hide("fast");
            }
            repaint();
        });
    //call load data
    getFromEndpoint();

    return {
        sayChainability : function(){
            $(selectedObjects).each(function(){});
            return selectedObjects;
        },
        getDebug : function(){
            console.log("<<<< all tags >>>>");
            console.log(dataAllTags);

            console.log("<<<< data >>>>");
            console.log(dataFilter);
            console.log("<<<< data >>>>");
            console.log(data);
            console.log("<<<< data full >>>>");
            console.log(dataFull);
            return selectedObjects;
        },
        refreshData : function(url){
            if(url && (url instanceof Array)){
                console.log('change url');
                settings.url = url;
            }
            getFromEndpoint();
            return selectedObjects;
        }
    };
};
