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
            die(json_encode( listar_tabla_impl($conexion, "ueas") ));                        
        }                                 

        // listar salones 
        $entrada = new input( );
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('listar_salones')));

        
        if($entrada->status( )) {
            die(json_encode( listar_tabla_impl($conexion, "salones") ));
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



        // listar profesores 
        $entrada = new input( );
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('listar_profesores')));

        
        if($entrada->status( )) {
            die(json_encode( listar_tabla_impl($conexion, "profesores") ));
        }


        // actualizar profesor
        $entrada = new input();
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('actualizar_profesor')));
        $entrada->validate($_POST, 'profesor', builtin_filter(FILTER_VALIDATE_INT));
        $entrada->validate($_POST, 'apellidos', make_filter('is_string'));
        $entrada->validate($_POST, 'nombre', make_filter('is_string'));
        $entrada->validate($_POST, 'email', make_filter('is_string'));
        $entrada->validate($_POST, 'departamento', make_filter('is_string'));
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
        $entrada->validate($_POST, 'email', make_filter('is_string'));
        $entrada->validate($_POST, 'departamento', make_filter('is_string'));
        $entrada->validate($_POST, 'notas', make_filter('is_string'));

        if($entrada->status( )){
            die(json_encode( crear_profesor_impl($conexion, $entrada->output('profesor'), $entrada->output('apellidos'), $entrada->output('nombre'), $entrada->output('email'), $entrada->output('departamento'), $entrada->output('notas' )  ) ));
        }

        
        die(json_encode([ 'estado' => false, 'valor' => 'error_invocacion' ]));                

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

 
    function listar_tabla_impl($conexion, $tabla){
        $query_string = 'SELECT * FROM ' . $tabla; 
        $filas = $conexion->query($query_string);
        return ['estado' => true, 'valor' => $filas];
    }


    function actualizar_salon_impl($conexion, $salon, $edificio, $nombre, $aforo100, $aforo75, $aforo50){
        $conexion->query('UPDATE salones SET edificio = ?, nombre = ?, aforo100 = ?, aforo75 = ?, aforo50 = ? WHERE salon = ?', $edificio, $nombre, $aforo100, $aforo75, $aforo50, $salon);

    }


    function crear_salon_impl($conexion, $edificio, $nombre, $aforo100, $aforo75, $aforo50){
        $conexion->query('INSERT IGNORE INTO salones (edificio, nombre, aforo100, aforo75, aforo50) VALUES (?, ?, ?, ?, ?)', $edificio, $nombre, $aforo100, $aforo75, $aforo50);
    }


    function actualizar_profesor_impl($conexion, $profesor, $apellidos, $nombre, $email, $departamento, $notas){
        $conexion->query('UPDATE profesores SET apellidos = ?, nombre = ?, email = ?, departamento = ?, notas = ? WHERE profesor = ?', $apellidos, $nombre, $email, $departamento, $notas, $profesor);

    }


    function crear_profesor_impl($conexion, $profesor, $apellidos, $nombre, $email, $departamento, $notas){
        $conexion->query('INSERT IGNORE INTO profesores (profesor, apellidos, nombre, email, departamento, notas) VALUES (?, ?, ?, ?, ?, ?)', $profesor, $apellidos, $nombre, $email, $departamento, $notas);
    }
?>