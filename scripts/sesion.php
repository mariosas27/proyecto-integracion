<?php
   require_once('../database/auth.php');
	require_once '../includes/google-PHP8/vendor/autoload.php';
	require_once('../includes/db_access.php');
   require_once('../includes/input.php');
   
   // main

   try {
      date_default_timezone_set('America/Mexico_City');
      $conexion = new db_access(HOST_DB, USER_DB, PASSWORD_DB, DATABASE_DB);

      $entrada = new input( );
      $entrada->validate($_POST, 'servicio', make_filter(match_predicate('entrar')));
      $entrada->validate($_POST, 'token', make_filter('is_string'));                 
      if ($entrada->status( )) {                                                     
         die(json_encode(entrar_impl($conexion, $entrada->output('token'))));        
      }                                                                              

      die(json_encode([ 'estado' => false, 'valor' => 'error_invocacion' ]));  
   } catch (Exception $ex) {                                                                 
      die(json_encode([ 'estado' => false, 'valor' => 'excepcion', 'mensaje' => $ex->getMessage( ) ]));
   }
   
   // implementación de casos de uso
   
   function entrar_impl($conexion, $token) {
		$cliente = new Google_Client([ 'client_id' => 'XXXXXX' ]);
		$cliente->setHttpClient(new \GuzzleHttp\Client([ 'curl' => [ CURLOPT_SSL_VERIFYPEER => false ] ]));
		if (!($payload = $cliente->verifyIdToken($token))) {
         return [ 'estado' => false, 'valor' => 'token_invalido' ];
      } else {
         return [ 'estado' => true, 'valor' => [ 'email' => $payload['email'], 'nombre' => $payload['name'] ] ];
      }
   }
?>