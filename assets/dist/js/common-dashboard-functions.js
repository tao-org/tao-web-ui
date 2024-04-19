
function updateTask(task){

    htmlContent = '';
    var taskStatus = task.taskStatus;
    var taskName = task.componentName;;

    var statusIcon = ui_getTaskStatusIcon(taskStatus);
    
    if (taskStatus === "RUNNING") {
        htmlContent += statusIcon + '<strong>' +taskName + '</strong>' + ' ['+ niceIsoTime(task.taskStart)+ ', updated '+ niceIsoTime(task.lastUpdated) +']' + ', @<strong>' + task.host + "</strong>";
        var percent = Number.isInteger(task.percentComplete) ? (task.percentComplete < 0 ? 0 : task.percentComplete) : Math.round(task.percentComplete*100)/100;
        htmlContent += "<div class='progress history'>" + "<div class='progress-bar progress-bar-info' role='progressbar' data-toggle='tooltip' data-placement='bottom' onmouseover='$(this).tooltip();' style='width:" + percent +"%'>" + percent + " %</div></div>";
    } else if (taskStatus === "UNDETERMINED") {
        htmlContent += statusIcon + '<strong>' + taskName/ + '</strong>';
    } else {
        htmlContent += statusIcon + '<strong>' +taskName + '</strong>' + ' ['+ niceIsoTime(task.taskStart)+ ', updated'+ niceIsoTime(task.lastUpdated) +']' + ', @<strong>' + task.host + "</strong>";
    }
    htmlContent += '</div>';
    return htmlContent;
}

function updateStatus(taskStatus, taskName, host, taskid){
    
    var percent = 0;
    var statusIcon = ui_getTaskStatusIcon(taskStatus); 
    var taskHost = (typeof host === 'undefined'? '' : ', @<strong>' + host + "</strong>");
    var htmlContent = '';

    if (taskStatus === "RUNNING") {
        htmlContent = "<div class='progress history'>" + "<div class='progress-bar progress-bar-info' role='progressbar' data-toggle='tooltip' data-placement='bottom' onmouseover='$(this).tooltip();' style='width:" + percent +"%'>" + percent + " %</div></div>";
    }else{
        if(taskStatus === "DONE" || taskStatus === "FAILED"){
            htmlContent = ' <button id="task_log_info_'+taskid+'" class="fa fa-info-circle log-info" value="'+taskid+'"></button>';
            htmlContent +='<div id="task_log_modal'+taskid+'" class="log-modal"><div class="log-modal-content"><div class="log-title-button"><div class="log-title"><h4 class="title">Task Log</h4></div><button type="button" class="log-close">&times;</button></div><p class="log_text">'+'</p></div></div>';
        
            htmlContent += '<button id="task_command_info_'+taskid+'" class="fa fa-terminal log-info" value="'+taskid+'"></button>';
            htmlContent += '<div id="command_info_modal'+taskid+'" class="log-modal"><div class="log-modal-content"><div class="command-title-button"><div class="command-title"><h4 class="title">Command Line</h4></div><button type="button" class="command-close">&times;</button></div><p class="command_text">'+'</p></div></div>';
        }else {
            htmlContent += statusIcon + '<strong>' + taskName/ + '</strong>' + taskHost;
        }
    }
    return htmlContent;
}

var ui_getTaskStatusIcon = function(taskStatus){
    var html = '<i class="icon fa fa-ban fa-fw" aria-hidden="true"></i>';
    if (taskStatus === "DONE") html = '<i class="icon fa fa-check fa-fw" aria-hidden="true" style="color: green;"></i>';
    if (taskStatus === "PENDING_FINALISATION") html = '<i class="icon fa fa-spinner fa-fw fa-spin" aria-hidden="true" style="color: orange;"></i>';
    if (taskStatus === "RUNNING") html = '<i class="icon fa fa-cog fa-fw fa-spin" aria-hidden="true" style="color: orange;"></i>';
    if (taskStatus === "UNDETERMINED") html = '<i class="icon fa fa-question fa-fw" aria-hidden="true" style="color: lightgrey;"></i>';
    if (taskStatus === "QUEUED_ACTIVE") html = '<i class="icon fa fa-forward fa-fw fa-fade" aria-hidden="true" style="color: grey;"></i>';
    return html;
}

function getTime(time){
        	
    var str = '';
    var seconds = parseInt(time, 10);
    var days = Math.floor(seconds / (3600*24));
    seconds  -= days*3600*24;
    var hrs   = Math.floor(seconds / 3600);
    seconds  -= hrs*3600;
    var mnts = Math.floor(seconds / 60);
    seconds  -= mnts*60;

    str = ( ((days != 0)? (days+'d '): '') + ((hrs != 0)? (hrs+'h '): '') + ((mnts != 0)? (mnts+'m'): ''));
    return str;
}