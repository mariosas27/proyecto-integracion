<?php
   require_once('../database/auth.php');
	require_once '../includes/google-PHP8/vendor/autoload.php';
	require_once('../includes/db_access.php');
   require_once('../includes/input.php');
   
   // main

   try {
      date_default_timezone_set('America/Mexico_City');
      session_start( );
      $conexion = new db_access(HOST_DB, USER_DB, PASSWORD_DB, DATABASE_DB);

      $entrada = new input( );
      $entrada->validate($_POST, 'servicio', make_filter(match_predicate('estado')));
      if ($entrada->status( )) {
         die(json_encode(estado_impl( )));
      }

      $entrada = new input( );
      $entrada->validate($_POST, 'servicio', make_filter(match_predicate('entrar')));
      $entrada->validate($_POST, 'token', make_filter('is_string'));                 
      if ($entrada->status( )) {                                                     
         die(json_encode(entrar_impl($entrada->output('token'))));        
      }                                                                              

      $entrada = new input( );
      $entrada->validate($_POST, 'servicio', make_filter(match_predicate('salir')));
      if ($entrada->status( )) {
         die(json_encode(salir_impl( )));
      }

      die(json_encode([ 'estado' => false, 'valor' => 'error_invocacion' ]));  
   } catch (Exception $ex) {                                                                 
      die(json_encode([ 'estado' => false, 'valor' => 'excepcion', 'mensaje' => $ex->getMessage( ) ]));
   }
   
   // implementación de casos de uso
   
   function estado_impl( ) {
      return [ 'estado' => true, 'valor' => (empty($_SESSION) ? [ ] : [ 'nombre' => $_SESSION['nombre'], 'departamento' => $_SESSION['departamento'] ]) ];
   }
   
   function entrar_impl($token) {
		$cliente = new Google_Client([ 'client_id' => '946102343979-9sbkkauvf8k7qeer1g300of8knfnu3pm.apps.googleusercontent.com' ]);
		$cliente->setHttpClient(new \GuzzleHttp\Client([ 'curl' => [ CURLOPT_SSL_VERIFYPEER => false ] ]));
		if (!($payload = $cliente->verifyIdToken($token))) {
         return [ 'estado' => false, 'valor' => 'token_invalido' ];
      }
      
      $autorizados = [
         'dircbi@azc.uam.mx' => null,
         'sacacbi@azc.uam.mx' => null,
         'coordti@azc.uam.mx' => null,
         'mgap@azc.uam.mx' => null,
         'al2183041903@azc.uam.mx' => null,
         'jdepcb@azc.uam.mx' => 'CB',
         'jdepel@azc.uam.mx' => 'EL',
         'jdepen@azc.uam.mx' => 'EN',
         'jdepma@azc.uam.mx' => 'MA',
         'jdepsi@azc.uam.mx' => 'SI',
      ];
      if (!array_key_exists($payload['email'], $autorizados)) {
         return [ 'estado' => false, 'valor' => 'email_invalido' ];
      }
      
      $_SESSION = [ 'nombre' => $payload['name'], 'departamento' => $autorizados[$payload['email']] ];
		return estado_impl( );
   }
   
   function salir_impl( ) {
      $_SESSION = [ ];
      return [ 'estado' => true, 'valor' => null ];
   }
?>