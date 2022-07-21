<?php
   require_once('../database/auth.php');
	require_once('../includes/db_access.php');
   require_once('../includes/input.php');
   
   // main

   try {
      date_default_timezone_set('America/Mexico_City');
      $conexion = new db_access(HOST_DB, USER_DB, PASSWORD_DB, DATABASE_DB);

      $entrada = new input( );
      $entrada->validate($_GET, 'servicio', make_filter(match_predicate('gatito')));         // pedir que en GET venga una variable "servicio" con valor "gatito"
      $entrada->validate($_GET, 'edad', builtin_filter(FILTER_VALIDATE_INT));                // pedir que en GET venga una variable "edad" que sea un entero
      if ($entrada->status( )) {                                                             // si todo se cumple, entonces  
         die(json_encode(gatito_impl($conexion, $entrada->output('edad'))));                 //    llamar a gatito_impl; le pasamos la conexión a la bd y el valor de "edad" que pasó el filtro de la entrada, ya convertido a entero
      }                                                                                      //    (en GET o POST todo viene como cadenas, pero el builtin_filter(FILTER_VALIDATE_INT) ya lo pasa a entero)
                                                                                             //    además, terminaremos el script imprimiendo el resultado de la función en formato JSON
                          
      // el script podría manejar más casos y se manejan de forma similar; por ejemplo:
      $entrada = new input( );
      $entrada->validate($_POST, 'servicio', make_filter(match_predicate('longitud')));      // pedir que en POST venga una variable "servicio" con valor "perrito"
      $entrada->validate($_POST, 'cadena', make_filter('is_string'));                        // pedir que en POST venga una variable "cadena" que sea cualquier cadena
      if ($entrada->status( )) {                                                             // si todo se cumple, entonces  
         die(json_encode(longitud_impl($entrada->output('cadena'))));                        //    llamar a perrito_impl; le pasamos el valor de "cadena" que pasó el filtro de la entrada
      }                                                                                      //    terminaremos el script imprimiendo el resultado de la función en formato JSON
                                                                                             
      // todas las respuestas del script serán en formato JSON y siempre tendrán al menos dos campos:        
      // "estado" con true o false (éxito o fracaso) y "valor" con un con valor (en caso de fracaso, con una razón del fracaso)
      die(json_encode([ 'estado' => false, 'valor' => 'error_invocacion' ]));                // si nada pegó, devolvemos fracaso        
   } catch (Exception $ex) {                                                                 
      die(json_encode([ 'estado' => false, 'valor' => 'excepcion', 'mensaje' => $ex->getMessage( ) ]));
   }
   
   // implementación de casos de uso
   
   function gatito_impl($conexion, $edad) {
      $filas = $conexion->query('SELECT ? + 1 AS suma', $edad);
      $resultado = $filas[0]['suma'];        // en este caso, el resultset sólo contiene una fila 
		return [ 'estado' => true, 'valor' => $resultado ];
   }
   
   function longitud_impl($cadena) {
      return [ 'estado' => true, 'valor' => strlen($cadena) ];
   }
?>