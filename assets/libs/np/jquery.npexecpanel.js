/*!
 * npExecPanels jQuery plugin
 * Released under the MIT license
 */

jQuery.fn.npExecPanels = function(options){
    var settings = $.extend({
        msgEmpty:"Empty dataset",
        msgEnd:"No more records",
        itemsOnPage: 3,
        url: ''
    }, options );

    var $panelWrapper = $(this)[0];
    var $panelEmpty = $(".panel-list-empty", $panelWrapper);
    var $notification = $(".box-notification",$panelWrapper);

    var data = [];
    var currentPage = 0;
    var pages = 0;

    var setNewData = function(d){
        data = d;
        renderExecHistoryCurrentPage(data);
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
            setNewData(response.data);
        }).fail(function (jqXHR, textStatus) {
            console.log("fail to retrive panel data");
        });
    };

    var renderExecHistoryCurrentPage = function(jobs){
        var $panel = $(".panel-list", $panelWrapper);
        $panel.empty();
        if(jobs){
            var count = jobs.length;
            pages = Math.ceil(count/settings.itemsOnPage);
            var itemStop = Math.max(0, count - currentPage*settings.itemsOnPage);
            var itemStart = Math.max(0, count - (currentPage+1)*settings.itemsOnPage);
            var showJobs = jobs.slice(itemStart, itemStop);
            for(i = showJobs.length; i>0; i--){
                var job = showJobs[i-1];
                var htmlContent = '<h4>'+job.workflowName+'</h4>';
                htmlContent += 'user: '+job.user+', status: '+job.jobStatus+' <small class="label label-info"><i class="fa fa-clock-o fa-fw"></i>'+datetimeFromArray(job.jobStart)+'</small> - <small class="label label-info"><i class="fa fa-clock-o fa-fw"></i>'+datetimeFromArray(job.jobEnd)+'</small>';
                htmlContent += '<div class="tasks">Task sumary:';
                for(ii = 0; ii<job.taskSummaries.length; ii++) {
                    var task = job.taskSummaries[ii];
                    var statusIcon = ui_getTaskStatusIcon(task.taskStatus);
                    htmlContent += '<div class="one-task">';
                    htmlContent += statusIcon + '<strong>' +task.componentName + '</strong>' +' ['+ datetimeFromArray(task.taskStart) +'-'+ datetimeFromArray(task.taskEnd) +']';
                    htmlContent += '</div>'
                }
                htmlContent += '</div>';
                var css = 'job-history-one'+ui_getJobStatusClass(job.jobStatus);
                var $newEl = $('<div>',{
                    'class' : css,
                    'html' : htmlContent
                });
                $panel.append($newEl);
            }
            //show end of records notice
            if(showJobs.length === 0){
                $("p",$panelEmpty).html(settings.msgEmpty);
                $panelEmpty.show();
            }else{
                $panelEmpty.hide();
            }
            //syncronize pagination
            $(".val-current-page",$panelWrapper).html(currentPage+1);
            if(currentPage < pages){
                $(".next",$panelWrapper).removeClass("disabled");
            }else{
                $(".next",$panelWrapper).addClass("disabled");
            }
            if(currentPage > 0){
                $(".prev",$panelWrapper).removeClass("disabled");
            }else{
                $(".prev",$panelWrapper).addClass("disabled");
            }
        }
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
    var ui_getTaskStatusIcon = function(taskStatus){
        var html = '<i class="icon fa fa-ban fa-fw" aria-hidden="true"></i>';
        if (taskStatus === "DONE") html = '<i class="icon fa fa-check fa-fw" aria-hidden="true"></i>';
        if (taskStatus === "RUNNING") html = '<i class="fa fa-bolt fa-fw" aria-hidden="true"></i>';
        if (taskStatus === "UNDETERMINED") html = '<i class="fa fa-question fa-fw" aria-hidden="true"></i>';
        return html;
    };
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
            if(action === 'go-next'){
                currentPage++;
            }
            if(action === 'go-prev'){
                currentPage--;
            }
            if(action === 'go-refresh'){
                currentPage = 0;
                ui_showExecNotification();
                //go-refresh
            }
            getData();
        });

    // Initializing
    currentPage = 0;
    getData();

    return this;
};
