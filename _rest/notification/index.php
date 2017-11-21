<?php
    if(rand(1,5)>2){
        die('{"payload":[]}');
    };


$payload=array();
if(rand(1,5)>2){
    $payload[]='{"id":12,"msg":"Deployment completed","type":"SUCCESS","ts":"'. time() .'"}';
};
if(rand(1,5)>2){
    $payload[]='{"id":10,"msg":"Execution failed","type":"ERROR","ts":"'. time() .'"}';
};
if(rand(1,5)>2){
    $payload[]='{"id":11,"msg":"Processing completed","type":"SUCCESS","ts":"'. time() .'"}';
};
if(rand(1,5)>2){
    $payload[]='{"id":15,"msg":"Product download completed","type":"SUCCESS","ts":"'. time() .'"}';
};

?>
{
"payload":
    [
<?php
echo implode(',',$payload);
?>
    ]
}