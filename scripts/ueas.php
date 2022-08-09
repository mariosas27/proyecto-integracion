<?php
    require_once('../database/auth.php');
    require_once('../includes/db_access.php');
    require_once('../includes/input.php');
   
   // main

    try {
        date_default_timezone_set('America/Mexico_City');
        $conexion = new db_access(HOST_DB, USER_DB, PASSWORD_DB, DATABASE_DB);
                        
        // listar ueas
        $entrada = new input( );
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('listar_ueas')));      
        if ($entrada->status( )) {                 
            die(json_encode( listar_ueas_impl($conexion) ));                        
        } 
        
        die(json_encode([ 'estado' => false, 'valor' => 'error_invocacion' ]));                
    } catch (Exception $ex) {                                                                 
        die(json_encode([ 'estado' => false, 'valor' => 'excepcion', 'mensaje' => $ex->getMessage( ) ]));
    }
   
   // implementación de casos de uso
 
    function listar_ueas_impl($conexion){
        $filas = $conexion->query('SELECT uea, nombre, horas FROM ueas');
        return ['estado' => true, 'valor' => $filas];
    }
?>