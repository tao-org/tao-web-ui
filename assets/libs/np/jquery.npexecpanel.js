/*!
 * npExecPanels jQuery plugin
 *
 * it only applies to a single DOM element and options must include end-point url
 * creates job execution lists and maintain pagination and data refresh
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

jQuery.fn.npExecPanels = function(options){
    var settings = $.extend({
        msgEmpty:"Empty dataset",
        msgEnd:"No more records",
        itemsOnPage: 3,
		type: "job",
        url: '',
		cancelURL: ''
    }, options );

    var $panelWrapper = $(this)[0];
    var $panelEmpty = $(".panel-list-empty", $panelWrapper);
    var $notification = $(".box-notification",$panelWrapper);
    var $pagination = $(".pagination:not(.actions)",$panelWrapper);
	var $panel = $(".panel-list", $panelWrapper);
	var $panelFilter = $(".panel-filter", $panelWrapper);
	var $like = $(".like",$panelWrapper);

	var datepickerScriptPath = "./assets/libs/jQuery-datepicker/jquery-ui.js";
	var datepickerCssPath = "./assets/libs/jQuery-datepicker/jquery-ui.css";
    var data = [];
    var dataFull = [];
	var filterAttributes = {};
	var createFilters = true;

	var username, userguid, clicking = false;
	
	var $mainElem = $(".content-wrapper",document.body).length > 0 ? $(".content-wrapper",document.body) : document.body;
	if ($('script[src*="'+datepickerScriptPath+'"]',$mainElem).length <= 0) {
		$('<script/>', {type: 'text/javascript',src: datepickerScriptPath}).appendTo($mainElem);
		$('<link/>', {rel: 'stylesheet',type: 'text/css',href: './assets/libs/jQuery-datepicker/jquery-ui.css'}).appendTo($mainElem);
	}
	var dataPagination = {
        directPagesNo: 1,
        itemsOnPage: settings.itemsOnPage,
        currentPage: 0
    };
	
    var setNewData = function(d){
        dataFull = d;
		if (settings.type === "task") {
			if (typeof settings.host !== "undefined") {
				dataFull = dataFull.filter(i => i.host === settings.host);
			}
		}
		data = dataFull;
		if (createFilters) {
			createFilterAttributes();
		} else {
			applyFilters();
		}
		renderData();
    };
	
	// allow filter atrributes based on configuration
	var createFilterAttributes = function() {
		if (typeof data.find(i => i.componentName) !== "undefined") {
			filterAttributes["componentName"] = "";
		} else if (typeof data.find(i => i.jobName) !== "undefined") {
			filterAttributes["jobName"] = "";
		}
		if (typeof data.find(i => i.taskStart) !== "undefined") {
			filterAttributes["taskStart-start"] = "";
			filterAttributes["taskStart-end"] = "";
		} else if (typeof data.find(i => i.jobStart) !== "undefined") {
			filterAttributes["jobStart-start"] = "";
			filterAttributes["jobStart-end"] = "";
		}
		repaintFilterBox();
	};
	
	//append ui elements based on configuration
    var repaintFilterBox = function() {
		$panelFilter.empty();
        if (!$.isEmptyObject(filterAttributes)) {
			var htmlContent = "<div class='box-tools pull-left'>" +
								"<div class='filter-inputs' style='display:none;'>";
			$.each(filterAttributes, function(key,val) {
				var label = "Label like";
				if (key.toLowerCase().endsWith("name")) {
					htmlContent += "<input type='text' class='search-box' name='" + key + "' placeholder='Search by label' autocomplete='off'/>";
				} else if (key.toLowerCase().endsWith("-start")) {
					htmlContent += "<input type='text' class='search-box datepicker' name='"+ key + "' placeholder='From date' autocomplete='off'/>";
					label = "From like";
				} else if (key.toLowerCase().endsWith("-end")) {
					htmlContent += "<input type='text' class='search-box datepicker' name='" + key + "' placeholder='To date' autocomplete='off'/>";
					label = "To like";
				} else {
					console.log("No repaint condition for filter: " + key);
				}
				$like.append("<span data-tag='tag' name='"+key+"'>"+label+": <strong class='val-q'></strong>&nbsp;<i class='fa fa-times fa-fw clear-filter' aria-hidden='true'></i></span>");
			});
			htmlContent += "</div>"; //close .filter-inputs
			htmlContent += "<i class='fa fa-search search-icon' data-action='show-filters'></i>"; //add search icon
			htmlContent += "</div>" //close .box-tool
			$panelFilter.append(htmlContent);
			$(".datepicker", $panelFilter).datepicker({
				dateFormat: "yy-mm-dd",
				onSelect: function (date){
					filterAttributes[$(this).attr("name")] = date;
					applyFilters();
				}
			});
            $panelFilter.show();
        } else {
            $panelFilter.hide();
        }
    };
	
	var refreshFilterUI = function(){
		$.each(filterAttributes, function(key,value) {
			if (value === "") {
				$("span[name='"+key+"']",$like).hide();
				$("input[name='"+key+"']",$panelFilter).val(value);
			} else {
				$("span[name='"+key+"']",$like).show();
				$(".val-q",$("span[name='"+key+"']",$like)).html(value);
			}
		});
		if ($("span",$like).filter(function() { return $(this).css("display") !== "none" }).length > 0) {
			$like.removeClass("collapse");
		} else {
			$like.addClass("collapse");
		}
    };
	
	var applyFilters = function() {
		refreshFilterUI();
		data = dataFull;
		$.each(filterAttributes, function(key,value) {
			if (value !== ""){
				if (key.indexOf("-") >= 0){
					var field = key.split("-")[0];
					var position = key.split("-")[1];
					data = dataFull.filter(function(e) {
								//set hours to 0
								var fieldDate = new Date(e[field]).setHours(0,0,0,0);
								var valueDate = new Date(value).setHours(0,0,0,0);
								if(position === "start") {
									if (fieldDate >= valueDate) {
										return e;
									}
								}
								if(position === "end") {
									if (fieldDate <= valueDate) {
										return e;
									}
								}
							});
				} else {
					var re = new RegExp(value, 'i');
					data = dataFull.filter(function(e) { if(e[key].match(re)) return e;});
				}
			}
		});
		renderData();
	};
	
	var renderData = function() {
		clearWrapper();
		repaintPagination();
		if (data.length < 1) {
			$panelEmpty.show();
		} else {
			$panelEmpty.hide();
			var visibleRange = {
				first: dataPagination.currentPage * dataPagination.itemsOnPage,
				last: dataPagination.currentPage* dataPagination.itemsOnPage+dataPagination.itemsOnPage
			};
			if(settings.type === "job" ) {
				var accordionID = $panelWrapper.getAttribute('id') + '_accordion';
				$panel.attr('id', accordionID );
				$.each(data, function(index, value) {
					if((index >= visibleRange.first) && (index < visibleRange.last)){
						drawJobCell(index, value, accordionID);
					}
				});
			} else if (settings.type === "task") {
				$.each(data, function(index, value) {
					if((index >= visibleRange.first) && (index < visibleRange.last)){
						drawTaskCell(index, value);
					}
				});
			} else {
				console.log("unable to render type" + settings.type + " !");
			}
		}
	};
	
    var getData = function(){
        $.ajax({
            cache: false,
            url: settings.url ,
            dataType : 'json',
            type: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Auth-Token": window.tokenKey
            }
        }).done(function (response) {
			var showUINotification = JSON.stringify(dataFull) !== JSON.stringify(response.data);
			if (data.length === 0 && showUINotification) {
				createFilters = true;
			}
			setNewData(response.data);
			if(showUINotification){
				ui_showExecNotification();
			}
        }).fail(function (jqXHR, status, textStatus) {
            console.log("fail to retrive panel data");
        });
    };

	var clearWrapper = function() {
        $panel.empty();
    };
	
	var repaintPagination = function() {
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
            if (fP <= 0) {
                fP = 0;
            } else {
				$pagination.append('<li><a href="#" data-page="0">'+1+'</a></li>');
			}
			if (fP > 1) {
                $pagination.append('<li class="disabled"><span>...</span></li>');
            }
            //append pages handlers
            for (i = fP; ((i <= lP) && (i < tP)); i++) {
                $pagination.append('<li class="'+((i === dataPagination.currentPage) ? 'active' : '')+'"><a href="#" data-page="'+i+'">'+(i+1)+'</a></li>');
            }
            if ((lP + dataPagination.directPagesNo + 1) < tP) {
                $pagination.append('<li class="disabled"><span>...</span></li>');
            }
			if ((lP + dataPagination.directPagesNo) < tP) {
				$pagination.append('<li><a href="#" data-page="'+(tP-1)+'">'+tP+'</a></li>');
            }
            //append next
            if ((dataPagination.currentPage+dataPagination.directPagesNo)<tP) {
                $pagination.append('<li><a href="#" data-page="'+(dataPagination.currentPage+1)+'">»</a></li>');
            }
            $pagination.show();
        }
    };
	
	var drawJobCell = function (index, job, accordionID) {
		// replace special characters with _ or remove them 
		var pID = job.id + "_" + job.jobName.replace(/[#_: /,]/g,'').replace(/[(]/g,'_').replace(/[)]/g,'').replace(/[&]/g,'And').replace(/[^a-zA-Z0-9]/g,'_');
		var htmlContent = '<div>'+
		'		<h4>'+
		'          <a data-toggle="collapse"  href="#'+pID+'" class="collapsed" aria-expanded="false">'+
		'             <h4>Job name: <strong>'+job.jobName+'</strong></h4>'+ 
		'		   </a>'+
		'		</h4>'+                               
		'	</div>'+
	
		'	<div id="'+pID+'" class="panel-collapse collapse" style="height: 0px; background-color: rgb(247, 250, 255);" aria-expanded="false" data-parent="#'+accordionID+'">';
				if (typeof job.workflowName !== "undefined") {
					htmlContent += '<p>Workflow: <b>'+job.workflowName+'</b></p>';
				}
				htmlContent += 'Status: '+ '<span id="jobStatus' + job.id +'">'+job.jobStatus+'</span> <small class="label label-info"><i class="fa fa-clock-o fa-fw"></i>'+niceIsoTime(job.jobStart)+'</small> - <small class="label label-info"><i class="fa fa-clock-o fa-fw"></i>'+niceIsoTime(job.jobEnd)+'</small>';
				//htmlContent += '<div class="tasks">Tasks:';
				if(job.taskSummaries !== undefined){
					htmlContent += '<div class="tasks">Tasks:';
					for(ii = 0; ii<job.taskSummaries.length; ii++) {
						var task = job.taskSummaries[ii];
						var statusIcon = ui_getTaskStatusIcon(task.taskStatus);
						htmlContent += '<div class="one-task" id='+ task.taskId + '>';
						
						if (task.taskStatus === "RUNNING") {
							htmlContent += statusIcon + '<strong>' +task.componentName + '</strong>' +' ['+ (typeof task.taskEnd === "undefined" ? 'updated ' + niceIsoTime(task.lastUpdated) : niceIsoTime(task.taskStart)+ '-'+ niceIsoTime(task.taskEnd)) +']' + ui_getTaskHost(task.host);
							var percent = Number.isInteger(task.percentComplete) ? (task.percentComplete < 0 ? 0 : task.percentComplete) : task.percentComplete.toFixed(1);
							htmlContent += "<div class='progress history'>" + "<div class='progress-bar progress-bar-info' role='progressbar' data-toggle='tooltip' data-placement='bottom' onmouseover='$(this).tooltip();' style='width:" + percent +"%'>" + percent + " %</div></div>";
						} else if (task.taskStatus === "UNDETERMINED") {
							htmlContent += statusIcon + '<strong>' +task.componentName + '</strong>';
						} else {
							htmlContent += statusIcon + '<strong>' +task.componentName + '</strong>' +' ['+ niceIsoTime(task.taskStart) + (typeof task.taskEnd === "undefined" ? ', updated ' + niceIsoTime(task.lastUpdated) : '-'+ niceIsoTime(task.taskEnd)) +']' + ui_getTaskHost(task.host);
						}

						if(task.taskStatus === "DONE" || task.taskStatus === "FAILED"){
							htmlContent += '<button id="task_log_info_'+task.taskId+'" class="icon fa fa-info-circle log-info" value="'+task.taskId+'"></button>';
							htmlContent +='<div id="task_log_modal'+task.taskId+'" class="log-modal"><div class="log-modal-content"><div class="log-title-button"><div class="log-title"><h4 class="title">Task Log</h4></div><button type="button" class="log-close">&times;</button></div><p class="log_text">'+'</p></div></div>';

							if (typeof task.command !== "undefined" && task.command !== "") {
								htmlContent += '<button id="task_command_info_'+task.taskId+'" class="icon fa fa-terminal log-info" value="'+task.taskId+'"></button>';
								htmlContent += '<div id="command_info_modal'+task.taskId+'" class="command-modal"><div class="command-modal-content"><div class="command-title-button"><div class="command-title"><h4 class="title">Command Line</h4></div><button type="button" class="command-close">&times;</button></div><p class="command_text">'+'</p></div></div>';
							}
						}
						
						htmlContent += "</div>";
					}
					htmlContent += '</div>';
				}
				//htmlContent += '</div>';
				// check if buttons mus be displayed, in order to create element for them
				if ((typeof settings.cancelURL !== "undefined" && settings.cancelURL !== '') || 
					(typeof settings.pauseURL !== "undefined" && settings.pauseURL !== '' && job.jobStatus === "RUNNING") || 
					(typeof settings.resumeURL !== "undefined" && settings.resumeURL !== '' && job.jobStatus === "SUSPENDED")) {
					htmlContent += "<div style='text-align:right'>";
					// pause or resume job button
					if (typeof settings.pauseURL !== "undefined" && settings.pauseURL !== '' && job.jobStatus === "RUNNING") {
						htmlContent += "<button class='btn btn-default pause-job'><i class='fa fa-pause-circle' style='color:#3c8dbc'></i> Pause</button>";
					} else if (typeof settings.resumeURL !== "undefined" && settings.resumeURL !== '' && job.jobStatus === "SUSPENDED") {
						htmlContent += "<button class='btn btn-default resume-job'><i class='fa fa-play-circle' style='color:#3c8dbc'></i> Resume</button>";
					}
					// cancel job button
					if (typeof settings.cancelURL !== "undefined" && settings.cancelURL !== '') {
						htmlContent += "<button class='btn btn-default cancel-job' style='margin-left:1em'><i class='fa fa-stop-circle' style='color:#3c8dbc'></i> Cancel</button>";
					}
					htmlContent += '</div>';
				}
				
			htmlContent = htmlContent +	'</div>';

		var css = 'job-history-one'+ui_getJobStatusClass(job.jobStatus)+' collapse panel';
		var $newEl = $('<div>',{
			'class' : css,
			'html' : htmlContent
		});
		$newEl.data("jobData",job);
		$newEl.appendTo($panel).fadeIn('slow');

		var selection = $("#"+accordionID).data("lastVisitedJob");
		if(typeof selection !== "undefined" && selection == pID){
			//$("#"+selection).collapse("show");
			$("#"+pID).collapse('show');
		}

		$("#"+pID)
		.on("show.bs.collapse", function(e){
			//$(e.target).closest(".job-history-one").siblings(".job-history-one").find(".panel-collapse.in").collapse('hide');
			$("#"+accordionID).data({"lastVisitedJob":e.target.id});
		})
		.on("hide.bs.collapse", function(e){
			$("#"+accordionID).removeData("lastVisitedJob");
		})
		.on("click", ".cancel-job", function(e) {
			var job = $(e.target.closest("[id]").parentElement).data("jobData");
			$('#confirm-dialog').modal('confirm',{
				msg:"Are you sure you want to cancel the job <strong>"+job.jobName+"</strong> ?",
				callbackConfirm: function() {
					ui_cancelJob({"jobId":job.id});
				},
				callbackCancel:function(){}
			});
		})
		.on("click", ".pause-job", function(e) {
			var job = $(e.target.closest("[id]").parentElement).data("jobData");
			$('#confirm-dialog').modal('confirm',{
				msg:"Are you sure you want to pause the job <strong>"+job.jobName+"</strong>?",
				callbackConfirm: function() {
					ui_pauseJob({"jobId":job.id});
				},
				callbackCancel:function(){}
			});
		})
		.on("click", ".resume-job", function(e) {
			var job = $(e.target.closest("[id]").parentElement).data("jobData");
			$('#confirm-dialog').modal('confirm',{
				msg:"Are you sure you want to resume the job <strong>"+job.jobName+"</strong>?",
				callbackConfirm: function() {
					ui_resumeJob({"jobId":job.id});
				},
				callbackCancel:function(){}
			});
		})
		.on("click","[id^='task_log_info']", function(e) {
			var taskId = $(this).val();
			ui_getTaskLog(taskId);
		})
		.on("click",".log-close", function(e) {
			var taskId = $(this).parents().siblings("[id^='task_log_info']").val();
			$("#task_log_modal"+taskId).hide();
		})
		.on("click","[id^='task_command_info']", function(e) {
			var taskId = $(this).val();
			ui_getTaskCommand(taskId);
		})
		.on("click",".command-close", function(e) {
			var taskId = $(this).parents().siblings("[id^='task_command_info']").val();
			$("#command_info_modal"+taskId).hide();
		});

		window.onclick = function(e){
			if(e.target == $("[id^='task_log_modal']")){
				$("[id^='task_log_modal']").hide();
			}
			if(e.target == $("[id^='command_info_modal']")){
				$("[id^='command_info_modal']").hide();
			}
		}
	};
	
	var drawTaskCell = function (index, task) {
		var statusIcon = ui_getTaskStatusIcon(task.taskStatus);
		var htmlContent = "<div class='col-md-12 col-sm-12'>" +
							"<div class='nodes-item-core-box'>";
		
		var cpuPercentage = parseInt(task.usedCPU/settings.availableResources.cpu*100);
		var ramPercentage = parseInt(task.usedRAM/settings.availableResources.memory*100);
		var completePercentage = Math.floor(task.percentComplete);

		
		var cpuProgressClass = cpuPercentage < 50 ? "progress-bar-success" : (cpuPercentage > 80 ? "progress-bar-danger" : "progress-bar-warning");
		var ramProgressClass = ramPercentage < 50 ? "progress-bar-success" : (ramPercentage > 80 ? "progress-bar-danger" : "progress-bar-warning");
		var completeProgressClass = "progress-bar-info";
		
		htmlContent += "<div class='box-top'>" +
							"<div class='box-title'>" +
								"<span>" + task.componentName + " (" + task.jobName + ")" + "</span>";

		htmlContent += "<button type='button' class='btn btn-primary btn-sm btn-flat btn-action btn-nodeop' data-action='view_command'>" +
								"<i class='fa fa-terminal fa-fw' aria-hidden='true'></i>" +
								"<span class='span-muted collapse'>&nbsp;View command line</span>" +
							"</button>";
		
		htmlContent += "</div>" + // close .box-title
						"<div class='box-text'>" +
							"<div> Start date: <strong>" + niceIsoTime(task.taskStart) + "</strong></div>" +
							"<div> Last update: <strong>" + niceIsoTime(task.lastUpdated) + "</strong></div>" +
						"</div>" + //close .box-text div
					"</div>";//close .box-top div
		htmlContent +=  "<div class='row'>" +
							"<div class='col-md-12 col-sm-12 col-xs-12 message'>" +
								"<div class='vm-row'>" +
									"<span> <strong>User:</strong> </span>" +
									"<div id='user-name'><strong><span>" + task.userId + "</span></strong></div>" +
								"</div>";
		if (task.componentType === "exec") {
			htmlContent += "<div class='vm-row'>" + 
				"<span> <strong>CPU:</strong> </span>" +
				"<div class='used-cpu-progress-bar'>" +
					"<div class='progress-bar " + cpuProgressClass + "' role='progressbar' style='width:" + cpuPercentage + "%'>" + cpuPercentage + "%</div>" +
				"</div>" +
			"</div>" +
			"<div class='vm-row'>" +
				"<span> <strong>RAM:</strong></span>" +
				"<div class='used-ram-progress-bar'>" +
					"<div class='progress-bar " + ramProgressClass + "' role='progressbar' style='width:" + ramPercentage + "%'>" + ramPercentage + "%</div>" +
				"</div>" +
			"</div>" +
			"<div class='vm-row'>" +
				"<span> <strong>Progress:</strong></span>" +
				"<div class='percent-complete-progress-bar'>" +
					"<div class='progress-bar " + completeProgressClass + "' role='progressbar' style='width:" + completePercentage + "%'>" + completePercentage + "%</div>" +
				"</div>" +
			"</div>";
		}
		htmlContent += "</div>" + //div .message
						"</div>"; // div .row
		htmlContent += "<div class='box-bottom'></div>";
		htmlContent += "</div>"; //div .nodes-item-core-box
		htmlContent += "</div>";
		
		var $newEl = $("<div>",{
			"html" : htmlContent
		});
		$newEl.addClass("task").prop("id", task.taskId);
		$newEl.data("taskData",task);
		$newEl.appendTo($panel).fadeIn("slow");

		$newEl
		.on("mousedown", "#user-name", function(e) {
			clicking = true;

			userguid = $(this).text();
			getUsername(userguid);
			$newEl.find("#user-name span").text(username);
		})
		.on('mouseup mouseleave', ".vm-row", function() {
			if(clicking === true){
				$newEl.find("#user-name span").text(userguid);
				clicking = false;
			}
		});
	};

	var ui_cancelJob = function(cancelData){
		$.ajax({
            cache: false,
            url: settings.cancelURL,
            data : cancelData,
            type: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                "X-Auth-Token": window.tokenKey
            }
        }).done(function (response) {
            console.log("job canceled");
			ui_showExecNotification();
			getData();
			$("#exec-history-panel").trigger("panel:refresh");
			$(document).trigger( "quota:update" );
        }).fail(function (jqXHR, status, textStatus) {
            console.log("fail to cancel the job");
        });
	};
	
	var ui_pauseJob = function(pauseData){
		$.ajax({
            cache: false,
            url: settings.pauseURL,
            data : pauseData,
            type: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                "X-Auth-Token": window.tokenKey
            }
        }).done(function (response) {
            console.log("job paused");
			ui_showExecNotification();
			getData();
        }).fail(function (jqXHR, status, textStatus) {
            console.log("fail to pause the job");
        });
	};
	
	var ui_resumeJob = function(resuneData){
		$.ajax({
            cache: false,
            url: settings.resumeURL,
            data : resuneData,
            type: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                "X-Auth-Token": window.tokenKey
            }
        }).done(function (response) {
            console.log("job resumed");
			ui_showExecNotification();
			getData();
        }).fail(function (jqXHR, status, textStatus) {
            console.log("fail to resume the job");
        });
	};
	
	var ui_clearJobs = function(){
		$.ajax({
            cache: false,
            url: settings.url,
            type: 'DELETE',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Auth-Token": window.tokenKey
            }
        }).done(function (response) {
            console.log("job history cleared");
			ui_showExecNotification();
			getData();
        }).fail(function (jqXHR, status, textStatus) {
            console.log("fail to clear the job history");
        });
	};
	
    var ui_getJobStatusClass = function(jobStatus){
        var className = ''; //UNDETERMINED
        if(jobStatus === "DONE") className = ' success';
        if(jobStatus === "FAILED") className = ' fail';
        if(jobStatus === "QUEUED_ACTIVE") className = ' queued-active';
        if(jobStatus === "SUSPENDED") className = ' suspended';
        if(jobStatus === "CANCELLED") className = ' cancelled';
        if(jobStatus === "RUNNING") className = ' running';
        return className;
    };

    var ui_getTaskHost = function(host){
        var html = '';
        if(host && host !== null){
            html = ', @<strong>' + host + "</strong>";
        }
        return html;
    };
    var ui_getTaskStatusIcon = function(taskStatus){
        var html = '<i class="icon fa fa-ban fa-fw" aria-hidden="true"></i>';
        if (taskStatus === "DONE") html = '<i class="icon fa fa-check fa-fw" aria-hidden="true" style="color: green;"></i>';
        if (taskStatus === "PENDING_FINALIZATION") html = '<i class="icon fa fa-spinner fa-fw fa-spin" aria-hidden="true" style="color: orange;"></i>';
        if (taskStatus === "RUNNING") html = '<i class="icon fa fa-cog fa-fw fa-spin" aria-hidden="true" style="color: orange;"></i>';
        if (taskStatus === "UNDETERMINED") html = '<i class="icon fa fa-question fa-fw" aria-hidden="true" style="color: lightgrey;"></i>';
        if (taskStatus === "QUEUED_ACTIVE") html = '<i class="icon fa fa-forward fa-fw fa-fade" aria-hidden="true" style="color: grey;"></i>';
        return html;
    };

	var ui_getTaskLog = function(taskId){
		$.ajax({
            cache: false,
            url: baseRestApiURL + 'orchestrator/tasks/' + taskId,
            type: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                "X-Auth-Token": window.tokenKey
            }
        }).done(function (response) {
			var output = ((typeof response.data.output === 'undefined' || response.data.output === '') ? 'There is no log message for the selected task': response.data.output);

			$modal = $("#task_log_modal"+taskId);
			$(".log_text", $modal).html(output);

			$modal.show();
        }).fail(function (jqXHR, status, textStatus) {
            console.log("fail to get task log");
        });
	}

	var ui_getTaskCommand = function(taskId){
		$.ajax({
            cache: false,
            url: baseRestApiURL + 'orchestrator/tasks/' + taskId,
            type: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                "X-Auth-Token": window.tokenKey
            }
        }).done(function (response) {
			var command = ((typeof response.data.command === 'undefined' || response.data.command === '') ? 'There is no command for the selected task': response.data.command);

			$modal = $("#command_info_modal"+taskId);

			var commandArea = "<textarea class='command-line' disabled>"+ command+"</textarea>";
			$(".command_text", $modal).html(commandArea);
			$('<style>.command-line { width:100%;height:90%;font-family:"Courier New";white-space:pre; resize: vertical; height: 40vh}</style>').appendTo($modal);
			$modal.show();
        }).fail(function (jqXHR, status, textStatus) {
            console.log("fail to command");
        });
	}

	function getUsername(guid){
        var getName = $.ajax({
            cache: false,
            url: baseRestApiURL + "user/name/" + guid,
            type: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Auth-Token": window.tokenKey
            }
        });

        $.when(getName).done(function (response) {
            if(response.status === "SUCCEEDED" && typeof response.data !== "undefined"){
                username = response.data;
            }else{
                showMsg("Could not retrieve username.", response.status);
				getUsername = guid;
            }
        }).fail(function () {
        });
    }

    var ui_showExecNotification = function(){
        $notification.addClass("show");
        setTimeout(function(){
            $notification.removeClass("show");
        }, 3000);
    };
	
    //add pagination handlers
    $($panelWrapper)
        .on("click"," .pagination a", function(e){
            e.preventDefault();
            if($(this).parent().hasClass("disabled")){
                console.log("return");
                return;
            }
            var action = $(this).data("action");
			if (typeof action === "undefined" || action !== 'go-clear') {
				createFilters = false;
				if(action === 'go-refresh') {
					//currentPage = 0;
					ui_showExecNotification();
					getData();
				} else if (typeof action === "undefined" && typeof $(this).data("page") !== "undefined"){
					dataPagination.currentPage = $(this).data("page");
					renderData();
				}
				//getData();
			} else {
				createFilters = true;
				ui_clearJobs();
            }
            /*if(action !== 'go-clear') {
				if(action === 'go-next'){
					currentPage++;
				}
				if(action === 'go-prev'){
					currentPage--;
				}
				if(action === 'go-refresh'){
					//currentPage = 0;
					ui_showExecNotification();
				}
				getData();
			} else {
				ui_clearJobs();
                //ui_showExecNotification();
            }*/
        })
        .on("panel:refresh", function(e) {
            //currentPage = 0;
            //ui_showExecNotification();
			createFilters = false;
            getData();
        })
		//repaint panel on window resize
		.on("panel:resize", function(e, noOfJobs){
			dataPagination.itemsOnPage = noOfJobs;
			renderData();
		})
		.on("click", ".panel-filter i", function(e){
			event.preventDefault();
            var action = $(this).data("action");
			if (action === "show-filters") {
				$(".filter-inputs", $panelFilter).toggle(1000);
			}
		});
	$like
        .on("click", ".clear-filter", function(e){
           filterAttributes[$(this).closest("[name]").attr("name")] = "";
           applyFilters();
        });
		
	$panelFilter
        .on('keyup', "input:not(.datepicker)", function(e){
			filterAttributes[$(this).attr("name")] = $(this).val();
            applyFilters();
        });
    // Initializing
	getData();
    return this;
};
