<?php
ob_start();
require './tao.config.php';
require './includes/db_functions.inc.php';
require './includes/session_functions.inc.php';
require './includes/format_functions.inc.php';
require './includes/auth.inc.php';
require './includes/renderer.inc.php';

//init session.
wsSessionInit();
//--LOGOUT-----------------
//wsKillSession();
//--TEMPLATE VARIABLES-----
$ws_template->pagemeta = array();
$ws_template->pagecontent['html_header'] = htmlGetSlice('header');
$ws_template->pagecontent['html_footer'] = htmlGetSlice('footer');
$ws_template->pagescripts = array();
//--CALL TEMPLATE----------
ob_end_clean();
htmlCallTemplate('login');
?>
