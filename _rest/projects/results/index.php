<?php
ob_start();
ob_end_clean();
//$from = get_POSTGETNULL("from");
//$to = get_POSTGETNULL("to");
//$order = get_POSTGETNULL("from");
$POSTparams = json_decode(file_get_contents("php://input"), true);

$request = NULL;
$msgcode = "FAIL";
$msgdetails = array("global" => "", "user" => "", "pass" => "", "location" => "" );
$msgdetails['global'] = "Unable to retrive resource.";

// make Fake Results ------------------
$dbFakeResults = array();
$dbFakeResults[35] = array('previewmode'=>'map', 'url' => 'http://194.102.135.13/_tao/test/gmap-overlay.php');
$dbFakeResults[36] = array('previewmode'=>'map', 'url' => 'http://www.openstreetmap.org/export/embed.html?bbox=11.263046264648438%2C45.1830048020745%2C12.00462341308594%2C45.60635207711834&amp;layer=mapnik');
$dbFakeResults[37] = array('previewmode'=>'map', 'url' => 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Berlin_satellite_image_with_Berlin_wall.jpg');
if (1 == 1){
    $request = "get";
    if(isset($dbFakeResults[$POSTparams['idfile']])){
        $rez = $dbFakeResults[$POSTparams['idfile']];
    }else{
        $rez = $dbFakeResults[37];
    }
    if( count($rez) > 0 ){
        $msgcode = "SUCCESS";
        $msgdetails['global'] = "Resource showed.";
//		$msgdetails['location'] = $ws->redirectURL['dashboard'];
    }
}
$payload  = json_encode($rez);
$hash = crc32($payload);
$json = '{
	"code": "200-OK",
	"request": "'.$request.'",
	"msgcode": "'.$msgcode.'",
	"payload": '.$payload.',
	"msgdetails":{
			"global": "'.$msgdetails['global'].'",
			"count": "'.count($rez).'",
			"hash": "'.$hash.'",
			"location": "'.$msgdetails['location'].'"
	}
}';
die($json);
?>