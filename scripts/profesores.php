<?php
    require_once('../database/auth.php');
    require_once('../includes/db_access.php');
    require_once('../includes/input.php');
   
   // main

    try {
        date_default_timezone_set('America/Mexico_City');
        $conexion = new db_access(HOST_DB, USER_DB, PASSWORD_DB, DATABASE_DB);
                    
        // listar profesores 
        $entrada = new input( );
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('listar_profesores')));
        if($entrada->status( )) {
            die(json_encode( listar_profesores_impl($conexion) ));
        }

        // actualizar profesor
        $entrada = new input();
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('actualizar_profesor')));
        $entrada->validate($_POST, 'profesor', builtin_filter(FILTER_VALIDATE_INT));
        $entrada->validate($_POST, 'apellidos', make_filter('is_string'));
        $entrada->validate($_POST, 'nombre', make_filter('is_string'));
        $entrada->validate($_POST, 'email', builtin_filter(FILTER_VALIDATE_EMAIL));
        $entrada->validate($_POST, 'departamento', make_filter(match_predicate('CB', 'EL', 'EN', 'MA', 'SI')), true);
        $entrada->validate($_POST, 'notas', make_filter('is_string'));
        if($entrada->status( )){
            die(json_encode( actualizar_profesor_impl($conexion, $entrada->output('profesor'), $entrada->output('apellidos'), $entrada->output('nombre'), $entrada->output('email'), $entrada->output('departamento'), $entrada->output('notas' )  ) ));
        }

        // crear profesor
        $entrada = new input();
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('crear_profesor')));
        $entrada->validate($_POST, 'profesor', builtin_filter(FILTER_VALIDATE_INT));
        $entrada->validate($_POST, 'apellidos', make_filter('is_string'));
        $entrada->validate($_POST, 'nombre', make_filter('is_string'));
        $entrada->validate($_POST, 'email', builtin_filter(FILTER_VALIDATE_EMAIL));
        $entrada->validate($_POST, 'departamento', make_filter(match_predicate('CB', 'EL', 'EN', 'MA', 'SI')), true);
        $entrada->validate($_POST, 'notas', make_filter('is_string'));
        if($entrada->status( )){
            die(json_encode( crear_profesor_impl($conexion, $entrada->output('profesor'), $entrada->output('apellidos'), $entrada->output('nombre'), $entrada->output('email'), $entrada->output('departamento'), $entrada->output('notas' )  ) ));
        }

        // eliminar profesor
        $entrada = new input();
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('eliminar_profesor')));
        $entrada->validate($_POST, 'profesor', builtin_filter(FILTER_VALIDATE_INT));

        if($entrada->status( )){
            die(json_encode( eliminar_profesor_impl($conexion, $entrada->output('profesor')  ) ));
        }

        die(json_encode([ 'estado' => false, 'valor' => 'error_invocacion' ]));                
    } catch (Exception $ex) {                                                                 
        die(json_encode([ 'estado' => false, 'valor' => 'excepcion', 'mensaje' => $ex->getMessage( ) ]));
    }
   
    // implementación de casos de uso

    function listar_profesores_impl($conexion){
        $filas = $conexion->query('SELECT profesor, apellidos, nombre, email, departamento, notas FROM profesores');
        return ['estado' => true, 'valor' => $filas];
    }

    function actualizar_profesor_impl($conexion, $profesor, $apellidos, $nombre, $email, $departamento, $notas){
        $conexion->query('UPDATE profesores SET apellidos = ?, nombre = ?, email = ?, departamento = ?, notas = ? WHERE profesor = ?', $apellidos, $nombre, $email, $departamento, $notas, $profesor);
        return ($conexion->affected_rows ? ['estado' => true, 'valor' => null] : ['estado' => false, 'valor' => 'inexistente']);  
    }

    function crear_profesor_impl($conexion, $profesor, $apellidos, $nombre, $email, $departamento, $notas){
        $conexion->query('INSERT IGNORE INTO profesores (profesor, apellidos, nombre, email, departamento, notas) VALUES (?, ?, ?, ?, ?, ?)', $profesor, $apellidos, $nombre, $email, $departamento, $notas);
        return ($conexion->affected_rows ? ['estado' => true, 'valor' => $conexion->insert_id] : ['estado' => false, 'valor' => 'duplicado']);      
    }

    function eliminar_profesor_impl($conexion, $profesor){
        $conexion->query('DELETE FROM profesores WHERE profesor = ?', $profesor);
        return ($conexion->affected_rows ? ['estado' => true, 'valor' => null] : ['estado' => false, 'valor' => 'inexistente'] );  

    }
?>