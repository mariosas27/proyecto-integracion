<?php
   require_once('../db/dev.auth.php');
	require_once '../includes/google-PHP8/vendor/autoload.php';
	require_once('../includes/db_access.php');
   require_once('../includes/input.php');
   
   // main

   try {
      date_default_timezone_set('America/Mexico_City');
      $conexion = new db_access(HOST_DB, USER_DB, PASSWORD_DB, DATABASE_DB);

      $entrada = new input( );
      $entrada->validate($_POST, 'servicio', make_filter(match_predicate('entrar')));        // pedir que en la petición POST venga una variable "servicio" con valor "entrar"
      $entrada->validate($_POST, 'token', make_filter('is_string'));                         // pedir que en la petición POST venga una variable "token" con una cadena
      if ($entrada->status( )) {                                                             // si todo se cumple, entonces
         die(json_encode(entrar_impl($conexion, $entrada->output('token'))));                //    llamar a entrar_impl; le pasamos la conexión a la base de datos y el valor de "token" que pasó el filtro de la entrada
      }                                                                                      //    terminaremos el script imprimiendo el resultado de la función en formato JSON
      
      // el script podría manejar más casos y se manejan de forma similar; por ejemplo:
      /*$entrada = new input( );
      $entrada->validate($_POST, 'servicio', make_filter(match_predicate('gatito')));        // pedir que en la petición POST venga una variable "servicio" con valor "gatito"
      $entrada->validate($_POST, 'edad', builtin_filter(FILTER_VALIDATE_INT));               // pedir que en la petición POST venga una variable "edad" que sea un entero
      if ($entrada->status( )) {                                                             // si todo se cumple, entonces  
         die(json_encode(gatito_impl($entrada->output('edad'))));                            //    llamar a gatito_impl; le pasamos el valor de "edad" que pasó el filtro de la entrada, ya convertido a entero
      }*/                                                                                    //    (en $_POST todo viene como cadenas, pero el builtin_filter(FILTER_VALIDATE_INT) ya lo pasa a entero)
                                                                                             //    terminaremos el script imprimiendo el resultado de la función en formato JSON
                                                                                             
      // todas las respuestas del script serán en formato JSON y siempre tendrán al menos dos campos:        
      // "estado" con true o false (éxito o fracaso) y "valor" con un con valor (en caso de fracaso, con una razón del fracaso)
      
      die(json_encode([ 'estado' => false, 'valor' => 'error_invocacion' ]));                // si nada pegó, devolvemos fracaso        
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