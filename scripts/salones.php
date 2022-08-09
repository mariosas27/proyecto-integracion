<?php
    require_once('../database/auth.php');
    require_once('../includes/db_access.php');
    require_once('../includes/input.php');
   
   // main

    try {
        date_default_timezone_set('America/Mexico_City');
        $conexion = new db_access(HOST_DB, USER_DB, PASSWORD_DB, DATABASE_DB);
        
        // listar salones 
        $entrada = new input( );
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('listar_salones')));
        if($entrada->status( )) {
            die(json_encode( listar_salones_impl($conexion) ));
        }

        // actualizar salon
        $entrada = new input();
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('actualizar_salon')));
        $entrada->validate($_POST, 'salon', builtin_filter(FILTER_VALIDATE_INT));
        $entrada->validate($_POST, 'edificio', make_filter('is_string'));
        $entrada->validate($_POST, 'nombre', make_filter('is_string'));
        $entrada->validate($_POST, 'aforo100', builtin_filter(FILTER_VALIDATE_INT));
        $entrada->validate($_POST, 'aforo75', builtin_filter(FILTER_VALIDATE_INT));
        $entrada->validate($_POST, 'aforo50', builtin_filter(FILTER_VALIDATE_INT));
        if($entrada->status( )){
            die(json_encode( actualizar_salon_impl($conexion, $entrada->output('salon'), $entrada->output('edificio'), $entrada->output('nombre'), $entrada->output('aforo100'), $entrada->output('aforo75'), $entrada->output('aforo50' )  ) ));
        }

        // crear/insertar salon
        $entrada = new input();
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('crear_salon')));
        $entrada->validate($_POST, 'edificio', make_filter('is_string'));
        $entrada->validate($_POST, 'nombre', make_filter('is_string'));
        $entrada->validate($_POST, 'aforo100', builtin_filter(FILTER_VALIDATE_INT));
        $entrada->validate($_POST, 'aforo75', builtin_filter(FILTER_VALIDATE_INT));
        $entrada->validate($_POST, 'aforo50', builtin_filter(FILTER_VALIDATE_INT));
        if($entrada->status( )){
            die(json_encode( crear_salon_impl($conexion, $entrada->output('edificio'), $entrada->output('nombre'), $entrada->output('aforo100'), $entrada->output('aforo75'), $entrada->output('aforo50' )  ) ));
        }

        // eliminar salon
        $entrada = new input();
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('eliminar_salon')));
        $entrada->validate($_POST, 'salon', builtin_filter(FILTER_VALIDATE_INT));

        if($entrada->status( )){
            die(json_encode( eliminar_salon_impl($conexion, $entrada->output('salon')  ) ));
        }

        die(json_encode([ 'estado' => false, 'valor' => 'error_invocacion' ]));                
    } catch (Exception $ex) {                                                                 
        die(json_encode([ 'estado' => false, 'valor' => 'excepcion', 'mensaje' => $ex->getMessage( ) ]));
    }
   
   // implementación de casos de uso
   
    function listar_salones_impl($conexion){
        $filas = $conexion->query('SELECT salon, edificio, nombre, aforo100, aforo75, aforo50 FROM salones');
        return ['estado' => true, 'valor' => $filas];
    }

    function actualizar_salon_impl($conexion, $salon, $edificio, $nombre, $aforo100, $aforo75, $aforo50){
        $conexion->query('UPDATE salones SET edificio = ?, nombre = ?, aforo100 = ?, aforo75 = ?, aforo50 = ? WHERE salon = ?', $edificio, $nombre, $aforo100, $aforo75, $aforo50, $salon);
        return ($conexion->affected_rows ? ['estado' => true, 'valor' => null] : ['estado' => false, 'valor' => 'inexistente'] );  
    }

    function crear_salon_impl($conexion, $edificio, $nombre, $aforo100, $aforo75, $aforo50){
        $conexion->query('INSERT IGNORE INTO salones (edificio, nombre, aforo100, aforo75, aforo50) VALUES (?, ?, ?, ?, ?)', $edificio, $nombre, $aforo100, $aforo75, $aforo50);
        return ($conexion->affected_rows ? ['estado' => true, 'valor' => $conexion->insert_id] : ['estado' => false, 'valor' => 'duplicado']);      
    }

    function eliminar_salon_impl($conexion, $salon){
        $conexion->query('DELETE FROM salones WHERE salon = ?', $salon);
        return ($conexion->affected_rows ? ['estado' => true, 'valor' => null] : ['estado' => false, 'valor' => 'inexistente'] );  
    }  
?>