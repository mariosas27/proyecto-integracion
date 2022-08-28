<?php
    require_once('../database/auth.php');
    require_once('../includes/db_access.php');
    require_once('../includes/input.php');
   
   // main

    try {
        date_default_timezone_set('America/Mexico_City');
        $conexion = new db_access(HOST_DB, USER_DB, PASSWORD_DB, DATABASE_DB);
        
        // listar grupos 
        $entrada = new input( );
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('listar_grupos')));
        if($entrada->status( )) {
            die(json_encode( listar_grupos_impl($conexion) ));
        }

        // actualizar salon
        $entrada = new input();
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('actualizar_grupo')));
        $entrada->validate($_POST, 'grupo', builtin_filter(FILTER_VALIDATE_INT));
        //para la tabla de grupos
        $entrada->validate($_POST, 'grupo_uea', builtin_filter(FILTER_VALIDATE_INT));
        $entrada->validate($_POST, 'grupo_clave', make_filter('is_string'));
        $entrada->validate($_POST, 'grupo_evaluacion', builtin_filter(FILTER_VALIDATE_INT));
        //para la tabla profesores_grupo
        $entrada->validate($_POST, 'profesores_grupo', json_filter('filtro_arreglo_profesores'));
        //para la tabla horarios_grupo
        $entrada->validate($_POST, 'horarios_grupo', json_filter('filtro_arreglo_horarios'));
        if($entrada->status( )){
            die(json_encode( actualizar_grupo_impl($conexion, $entrada->output('grupo') ,$entrada->output('grupo_uea'), $entrada->output('grupo_clave'), $entrada->output('grupo_evaluacion'), $entrada->output('profesores_grupo' ), $entrada->output('horarios_grupo')  ) ));
        }

        // crear/insertar grupo
        $entrada = new input();
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('crear_grupo')));
        //para la tabla de grupos
        $entrada->validate($_POST, 'grupo_uea', builtin_filter(FILTER_VALIDATE_INT));
        $entrada->validate($_POST, 'grupo_clave', make_filter('is_string'));
        $entrada->validate($_POST, 'grupo_evaluacion', builtin_filter(FILTER_VALIDATE_INT));
        //para la tabla profesores_grupo
        $entrada->validate($_POST, 'profesores_grupo', json_filter('filtro_arreglo_profesores'));
        //para la tabla horarios_grupo
        $entrada->validate($_POST, 'horarios_grupo', json_filter('filtro_arreglo_horarios'));

        if($entrada->status( )){
            die(json_encode( crear_grupo_impl($conexion, $entrada->output('grupo_uea'), $entrada->output('grupo_clave'), $entrada->output('grupo_evaluacion'), $entrada->output('profesores_grupo' ), $entrada->output('horarios_grupo')  ) ));
        }

        // eliminar salon
        $entrada = new input();
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('eliminar_grupo')));
        $entrada->validate($_POST, 'grupo', builtin_filter(FILTER_VALIDATE_INT));

        if($entrada->status( )){
            die(json_encode( eliminar_grupo_impl($conexion, $entrada->output('grupo')  ) ));
        }

        die(json_encode([ 'estado' => false, 'valor' => 'error_invocacion' ]));                
    } catch (Exception $ex) {                                                                 
        die(json_encode([ 'estado' => false, 'valor' => 'excepcion', 'mensaje' => $ex->getMessage( ) ]));
    }
   
   // implementación de casos de uso
   
    function listar_grupos_impl($conexion){
        $filas_grupos = $conexion->query('SELECT grupo, uea, clave, evaluacion FROM grupos');
        $filas_horarios_grupo = $conexion->query('SELECT horario_grupo, grupo, salon, dia, inicio, termino FROM horarios_grupo');
        $filas_profesores_grupo = $conexion->query('SELECT profesor_grupo, grupo, profesor FROM profesores_grupo');
        return ['estado' => true, 'valor' => ['grupos' => $filas_grupos, 'horarios_grupos' => $filas_horarios_grupo, 'profesores_grupo' => $filas_profesores_grupo] ];
    }

    function crear_grupo_impl($conexion, $grupo_uea, $grupo_clave, $grupo_evaluacion, $profesores_grupo, $horarios_grupo){
        // insertamos en la tabla grupo
        $conexion->query('INSERT IGNORE INTO grupos (uea, clave, evaluacion) VALUES (?, ?, ?)', $grupo_uea, $grupo_clave, $grupo_evaluacion);
        if(!$conexion->affected_rows){
            return ['estado' => false, 'valor' => 'duplicado'];
        }
        $id_grupo = $conexion->insert_id;
        //insertamos en la tabla profesores_grupo        
        foreach($profesores_grupo as $id_profesor){
            $conexion->query('INSERT IGNORE INTO profesores_grupo (grupo, profesor) VALUES (?, ?)', $id_grupo, $id_profesor);
        }
        // Insertamos en la tabla horario_grupo 
        foreach($horarios_grupo as $horario){
            $conexion->query('INSERT IGNORE INTO horarios_grupo (grupo, salon, dia, inicio, termino) VALUES (?, ?, ?, ?, ?)', $id_grupo, $horario['salon'], $horario['dia'], $horario['inicio'], $horario['termino']);
        }
        return ['estado' => true, 'valor' => $id_grupo];
    }
    
    function eliminar_grupo_impl($conexion, $grupo){
        $conexion->query('DELETE FROM horarios_grupo WHERE grupo = ?', $grupo);
        $conexion->query('DELETE FROM profesores_grupo WHERE grupo = ?', $grupo);
        $conexion->query('DELETE FROM grupos WHERE grupo = ?', $grupo);
        return ($conexion->affected_rows ? ['estado' => true, 'valor' => null] : ['estado' => false, 'valor' => 'inexistente'] );  
    } 

    function actualizar_grupo_impl($conexion, $grupo, $grupo_uea, $grupo_clave, $grupo_evaluacion, $profesores_grupo, $horarios_grupo){
        // actualizamos la tabla grupo
        $conexion->query('UPDATE grupos SET uea = ?, clave = ?, evaluacion = ? WHERE grupo = ?', $grupo_uea, $grupo_clave, $grupo_evaluacion, $grupo);
        if(!$conexion->affected_rows){
            return ['estado' => false, 'valor' => 'inexistente'];
        }
        //eliminamos los las filas de la tabla profesores_grupos que establecen una relación entre un profesor y el grupo a actualizar, lo mismo para horarios_grupos
        $conexion->query('DELETE FROM horarios_grupo WHERE grupo = ?', $grupo);
        $conexion->query('DELETE FROM profesores_grupo WHERE grupo = ?', $grupo);
        //insertamos la nueva info en la tabla profesores_grupo        
        foreach($profesores_grupo as $id_profesor){
            $conexion->query('INSERT IGNORE INTO profesores_grupo (grupo, profesor) VALUES (?, ?)', $grupo, $id_profesor);
        }
        // Insertamos la nueva info en la tabla horario_grupo 
        foreach($horarios_grupo as $horario){
            $conexion->query('INSERT IGNORE INTO horarios_grupo (grupo, salon, dia, inicio, termino) VALUES (?, ?, ?, ?, ?)', $grupo, $horario['salon'], $horario['dia'], $horario['inicio'], $horario['termino']);
        }
        return ['estado' => true, 'valor' => $grupo];
    }
    


    function filtro_arreglo_horarios($horarios) {         // debe regresar el arreglo validado o nulo si estaba mal
        if (is_array($horarios)) {
            foreach($horarios as $horario){
                if( !isset( $horario['salon'], $horario['dia'], $horario['inicio'], $horario['termino'] ) ) {
                    return null;
                }
            }
            return $horarios;
        }
        return null;
    }

    function filtro_arreglo_profesores($profesores_grupo){
        if (is_array($profesores_grupo)) {
            foreach($profesores_grupo as $id_profesor){
                if( !is_int($id_profesor) )  {
                    return null;
                }
            }
            return $profesores_grupo;
        }
        return null;
    }
?>