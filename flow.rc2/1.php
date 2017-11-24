<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<meta name="viewport" content="width=device-width">
<title>jsPlumb Workflow</title>		
<link href="//fonts.googleapis.com/css?family=Lato:400,700" rel="stylesheet">

<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
<link rel="stylesheet" href="//code.jquery.com/ui/1.11.1/themes/smoothness/jquery-ui.css">
<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">

<link href="./css/main.css" rel="stylesheet">
<link rel="stylesheet" href="./css/jsplumbtoolkit-defaults.css">
<link rel="stylesheet" href="./css/jsplumbtoolkit-demo.css">
<link rel="stylesheet" href="./app.css">
<link rel="stylesheet" href="./workspace.css">
</head>
<body class="jtk-bootstrap jtk-bootstrap-wide noselect">

<div class="timeline-toolbar">
				<div class="back-home" rel="timeline-tooltip" data-original-title="Return to Title">
					<div class="icon timeline-toolbar-action" data-action="home"><i class="fa fa-reply-all fa-fw" aria-hidden="true"></i></div>
				</div>
				<div class="zoom-in" rel="timeline-tooltip" data-original-title="Zoom In">
					<div class="icon timeline-toolbar-action" data-action="zoom-plus" data-repeateonhold="on"><i class="fa fa-search-plus fa-fw" aria-hidden="true"></i></div>
				</div>
				<div class="zoom-out" rel="timeline-tooltip" data-original-title="Zoom Out">
					<div class="icon timeline-toolbar-action" data-action="zoom-minus" data-repeateonhold="on"><i class="fa fa-search-minus fa-fw" aria-hidden="true"></i></div>
				</div>
				<div class="pann-past" rel="timeline-tooltip" data-original-title="Move Left">
					<div class="icon timeline-toolbar-action" data-action="intothepast" data-repeateonhold="on"><i class="fa fa-step-backward fa-fw" aria-hidden="true"></i></div>
				</div>
				<div class="pann-future" rel="timeline-tooltip" data-original-title="Move Right">
					<div class="icon timeline-toolbar-action" data-action="intothefuture" data-repeateonhold="on"><i class="fa fa-step-forward fa-fw" aria-hidden="true"></i></div>
				</div>
				<div class="free-select" rel="timeline-tooltip" data-original-title="Free select">
					<div class="icon timeline-toolbar-action" data-action="free-select" data-selectable="on"><i class="fa fa-pencil fa-fw" aria-hidden="true"></i></div>
				</div>
				<div class="empty-wf" rel="timeline-tooltip" data-original-title="Clear Workflow">
					<div class="icon timeline-toolbar-action" data-action="empty-wf" data-selectable="on"><i class="fa fa-trash fa-fw" aria-hidden="true"></i></div>
				</div>
				<div class="tl-expand" rel="timeline-tooltip" data-original-title="Fullscreen expand or collapse">
					<div class="icon timeline-toolbar-action" data-action="tl-expand" data-selectable="on"><i class="fa fa-expand fa-fw" aria-hidden="true"></i></div>
				</div>
</div>
        <div class="jtk-page-container">
            <div class="jtk-container">
                
<div class="jtk-demo-main">
<!-- demo -->
            <div class="jtk-demo-canvas canvas-wide statemachine-demo jtk-surface jtk-surface-nopan noselect" id="canvas">
<?php
/*
				<div class="w" id="opened">Node 1
                    <div class="ep" action="begin"></div>
                </div>
                <div class="w" id="phone1">Node 2
                    <div class="ep" action="phone1"></div>
                </div>
                <div class="w" id="phone2">Node 3
                    <div class="ep" action="phone2"></div>
                </div>
                <div class="w" id="inperson">Node 4
                    <div class="ep" action="inperson"></div>
                </div>
                <div class="w" id="rejected">Node 5
                    <div class="ep" action="rejected"></div>
                </div>
*/
?>				
            </div>
			<!-- miniview -->
            <div class="miniview"></div>
			<div id="infoband"></div>
<!-- /demo -->
</div>
            </div>
        </div>
		
		
<div id="tools-toolbox" class="ui-widget-content collapse">
  <p class="ui-widget-header">Toolbox</p>
	<button id="np-add-block" type="button" class="btn btn-default btn-lg">
		<i class="fa fa-plus fa-fw" aria-hidden="true"></i><span class="sr-only">Add module</span>
	</button>
	<button id="np-enable-select" type="button" class="btn btn-default btn-lg">
		<i class="fa fa-magic fa-fw" aria-hidden="true"></i><span class="sr-only">Enable select mode</span>
	</button>
</div>
<div id="draggable-toolbox-modules" class="ui-widget-content collapse">
  <p class="ui-widget-header">Modules</p>
  <ol id="selectable">
  </ol>
</div>

<div id="draggable-toolbox-modules-source" class="ui-widget-content">
  <p class="ui-widget-header">Components</p>
<!-- xxxxxxxxxxxxxxxxxxxxxxxxx -->
<ul class="nav nav-tabs">
  <li class="active"><a data-toggle="tab" href="#home">Data Sources</a></li>
  <li><a data-toggle="tab" href="#menu1">Modules</a></li>
</ul>

<div class="tab-content">
  <div id="home" class="tab-pane in active">
		<div id="datasourceslist" class="modulesholder">
				<sortable_item class="item selected" index="0" data-dna='{"mtype":"ds-SciHubSentinel-1","mlabel":"SciHub Sentinel-1"}'>
					<div class="item-preview">
					  <vectr_img page="0" src="" paused="true" style="display: block; width: 100%; height: 100%;">
						<img src="media/module-ds.png" style="width: 100%; height: 100%;">
					  </vectr_img>
					</div>
					<div class="item-info">
					  <div class="item-label text-left">SciHub Sentinel-1</div>
					</div>
				</sortable_item>
				<sortable_item class="item selected" index="0" data-dna='{"mtype":"ds-SciHubSentinel-2","mlabel":"SciHub Sentinel-2"}'>
					<div class="item-preview">
					  <vectr_img page="0" src="" paused="true" style="display: block; width: 100%; height: 100%;">
						<img src="media/module-ds.png" style="width: 100%; height: 100%;">
					  </vectr_img>
					</div>
					<div class="item-info">
					  <div class="item-label text-left">SciHub Sentinel-2</div>
					</div>
				</sortable_item>
				<sortable_item class="item selected" index="0" data-dna='{"mtype":"ds-AWSSentinel2","mlabel":"AWS Sentinel-2"}'>
					<div class="item-preview">
					  <vectr_img page="0" src="" paused="true" style="display: block; width: 100%; height: 100%;">
						<img src="media/module-ds.png" style="width: 100%; height: 100%;">
					  </vectr_img>
					</div>
					<div class="item-info">
					  <div class="item-label text-left">AWS Sentinel-2</div>
					</div>
				</sortable_item>
				<sortable_item class="item selected" index="0" data-dna='{"mtype":"ds-AWSLandsat8","mlabel":"AWS Landsat 8"}'>
					<div class="item-preview">
					  <vectr_img page="0" src="" paused="true" style="display: block; width: 100%; height: 100%;">
						<img src="media/module-ds.png" style="width: 100%; height: 100%;">
					  </vectr_img>
					</div>
					<div class="item-info">
					  <div class="item-label text-left">AWS Landsat 8</div>
					</div>
				</sortable_item>
				<sortable_item class="item selected" index="0" data-dna='{"mtype":"ds-Local","mlabel":"Local Data Source"}'>
					<div class="item-preview">
					  <vectr_img page="0" src="" paused="true" style="display: block; width: 100%; height: 100%;">
						<img src="media/module-ds.png" style="width: 100%; height: 100%;">
					  </vectr_img>
					</div>
					<div class="item-info">
					  <div class="item-label text-left">Local Data Source</div>
					</div>
				</sortable_item>				
		</div>
  </div>
  <div id="menu1" class="tab-pane">
		<div id="moduleslist" class="modulesholder">
				<sortable_item class="item selected" index="0" data-dna='{"mtype":"otb-BandMath","mlabel":"Band Math"}'>
					<div class="item-preview">
					  <vectr_img page="0" src="" paused="true" style="display: block; width: 100%; height: 100%;">
						<img src="media/module-otb.png" style="width: 100%; height: 100%;">
					  </vectr_img>
					</div>
					<div class="item-info">
					  <div class="item-label text-left">OTB Band Math</div>
					</div>
				</sortable_item>
				<sortable_item class="item selected" index="0" data-dna='{"mtype":"otb-ConcatenateImages","mlabel":"Images Concatenation"}'>
					<div class="item-preview">
					  <vectr_img page="0" src="" paused="true" style="display: block; width: 100%; height: 100%;">
						<img src="media/module-otb.png" style="width: 100%; height: 100%;">
					  </vectr_img>
					</div>
					<div class="item-info">
					  <div class="item-label text-left">OTB Images Concatenation</div>
					</div>
				</sortable_item>
				<sortable_item class="item selected" index="0" data-dna='{"mtype":"otb-Convert","mlabel":"Image Conversion"}'>
					<div class="item-preview">
					  <vectr_img page="0" src="" paused="true" style="display: block; width: 100%; height: 100%;">
						<img src="media/module-otb.png" style="width: 100%; height: 100%;">
					  </vectr_img>
					</div>
					<div class="item-info">
					  <div class="item-label text-left">Image Conversion</div>
					</div>
				</sortable_item>
				<sortable_item class="item selected" index="0" data-dna='{"mtype":"otb-ColorMapping","mlabel":"Color Mapping"}'>
					<div class="item-preview">
					  <vectr_img page="0" src="" paused="true" style="display: block; width: 100%; height: 100%;">
						<img src="media/module-otb.png" style="width: 100%; height: 100%;">
					  </vectr_img>
					</div>
					<div class="item-info">
					  <div class="item-label text-left">Color Mapping</div>
					</div>
				</sortable_item>
				<sortable_item class="item selected" index="0" data-dna='{"mtype":"mod-NewModule","mlabel":"New Module"}'>
					<div class="item-preview">
					  <vectr_img page="0" src="" paused="true" style="display: block; width: 100%; height: 100%;">
						<img src="media/module01.png" style="width: 100%; height: 100%;">
					  </vectr_img>
					</div>
					<div class="item-info">
					  <div class="item-label text-left">New Module</div>
					</div>
				</sortable_item>
		</div>
  </div>
</div>
<!-- xxxxxxxxxxxxxxxxxxxxxxxxx -->
</div>

<div id="draggable-toolbox-modules-properties" class="ui-widget-content">
  <p class="ui-widget-header">Component properties</p>
<!-- xxxxxxxxxxxxxxxxxxxxxxxxx -->
<section class="content tpl-prop tpl-ds collapse">
	<div class="col-md-12 prop-head">
		<span>Data Source SciHub</span>
	</div>
	<div class="col-md-12 prop-body">
		<form>
		  <div class="form-group">
			<label for="exampleSelect1">Platform name</label>
			<select class="form-control" id="exampleSelect1" disabled>
			  <option>Sentinel-1</option>
			  <option selected>Sentinel-2</option>
			  <option>Sentinel-3</option>
			</select>
		  </div>

		  <div class="form-group">
			<label for="exampleInputEmail1">Begin position</label>
			<input type="date" class="form-control" id="exampleInputEmail1" placeholder="" autocomplete="off" value="2017-06-22">
		  </div>
		  <div class="form-group">
			<label for="exampleInputPassword1">Cloud cover</label>
			<input type="number" step="0.01" class="form-control" id="exampleInputPassword1" placeholder="" autocomplete="off" value="75.00">
		  </div>
		  <div class="form-group">
			<label for="exampleTextarea">Footprint</label>
			<textarea class="form-control" id="exampleTextarea" rows="4">
POLYGON((-9.9866909768 23.4186029838, -8.9037319257 23.4186029838, -8.9037319257 24.413397299, -9.9866909768 24.413397299, -9.9866909768 23.4186029838))
			</textarea>
		  </div>
		  <button type="submit" class="btn btn-primary">Submit</button>
		</form>
	</div>
</section>
<section class="content tpl-prop tpl-otb-bm collapse">
	<div class="col-md-12 prop-head">
		<span>OTB Band Math</span>
	</div>
	<div class="col-md-12 prop-body">
		<form>
		  <div class="form-group">
			<label for="exampleInputEmail1">Location</label>
			<input type="text" class="form-control" id="exampleInputEmail1" placeholder="" autocomplete="off" value="/usr/bin/otbcli_BandMath">
		  </div>
		  <div class="form-group">
			<label for="exampleInputPassword1">Input images</label>
			<textarea class="form-control" id="exampleTextarea" rows="3"></textarea>
		  </div>
		  <div class="form-group">
			<label for="exampleInputEmail1">Output image</label>
			<input type="text" class="form-control" id="exampleInputEmail1" placeholder="" autocomplete="off" value="">
		  </div>
		  <div class="form-group">
			<label for="exampleTextarea">Expresion</label>
			<textarea class="form-control" id="exampleTextarea" rows="3"></textarea>
		  </div>
		  <button type="submit" class="btn btn-primary">Submit</button>
		</form>
	</div>
</section>
<section class="content tpl-prop tpl-otb-concat collapse">
	<div class="col-md-12 prop-head">
		<span>OTB Concatenate Images</span>
	</div>
	<div class="col-md-12 prop-body">
		<form>
		  <div class="form-group">
			<label for="exampleInputEmail1">Location</label>
			<input type="text" class="form-control" id="exampleInputEmail1" placeholder="" autocomplete="off" value="/usr/bin/otbcli_ConcatenateImages">
		  </div>
		  <div class="form-group">
			<label for="exampleInputPassword1">Input images</label>
			<textarea class="form-control" id="exampleTextarea" rows="3"></textarea>
		  </div>
		  <div class="form-group">
			<label for="exampleInputEmail1">Output image</label>
			<input type="text" class="form-control" id="exampleInputEmail1" placeholder="" autocomplete="off" value="">
		  </div>
		  <button type="submit" class="btn btn-primary">Submit</button>
		</form>
	</div>
</section>

<section class="content tpl-prop tpl-unknown collapse">
	<div class="col-md-12 prop-body">
<p class="please-select" >No properties defined for selected component.</p>
	</div>
</section>
<section class="content tpl-prop tpl-none">
	<div class="col-md-12 prop-body">
<p class="please-select" >Please select a component to display its properties.</p>
	</div>
</section>
<section class="content tpl-prop tpl-multiple collapse">
	<div class="col-md-12 prop-body">
<p class="please-select" >Multiple components selected. Please select just one component to display its properties.</p>
	</div>
</section>
<!-- xxxxxxxxxxxxxxxxxxxxxxxxx -->
</div>

<div id="rubberband" style="display:none;"></div>
		


<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
<script src="./lib/jsplumb.js"></script>

<script src="./workspace.js"></script>
<script src="./app.js"></script>
</body>
</html>
