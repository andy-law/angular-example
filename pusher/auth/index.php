<?
require_once('Pusher.php');
header('Cache-Control: no-cache, must-revalidate');
header('Content-type: application/javascript');
$pusher = new Pusher('143596c14eddb2982ed5', '7ec32a20cc84452d66fc', '57196');
$auth = $pusher->socket_auth($_GET['channel_name'], $_GET['socket_id']);

$callback = str_replace('\\', '', $_GET['callback']);
echo($callback . '(' . $auth . ');');

//$pusher->trigger($_GET['channel_name'],'event','data','socket_id');
//echo $pusher->socket_auth($_POST['channel_name'], $_POST['socket_id']);
