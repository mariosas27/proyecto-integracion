<?php
    require_once('../database/auth.php');
    require_once('../includes/db_access.php');
    require_once('../includes/input.php');
   
   // main

    try {
        date_default_timezone_set('America/Mexico_City');
        session_name('programacion_grupos'); session_start( );
        $conexion = new db_access(HOST_DB, USER_DB, PASSWORD_DB, DATABASE_DB);
        if (empty($_SESSION)) {
           die(json_encode([ 'estado' => false, 'valor' => 'no_autenticado' ]));
        }
        
        $entrada = new input( );
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('listar_evaluaciones')));
        if($entrada->status( )){
            die(json_encode( listar_evaluaciones_impl($conexion) ));
        }
        
        $entrada = new input( );
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('listar_grupos')));
        $entrada->validate($_POST, 'evaluacion', builtin_filter(FILTER_VALIDATE_INT));
        if($entrada->status( )) {
            die(json_encode( listar_grupos_impl($conexion, $entrada->output('evaluacion')) ));
        }
        
        $entrada = new input();
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('crear_grupo')));
        $entrada->validate($_POST, 'evaluacion', builtin_filter(FILTER_VALIDATE_INT));
        $entrada->validate($_POST, 'uea', builtin_filter(FILTER_VALIDATE_INT));
        $entrada->validate($_POST, 'clave', make_filter('is_string'));
        $entrada->validate($_POST, 'cupo', builtin_filter(FILTER_VALIDATE_INT));
        $entrada->validate($_POST, 'profesores', json_filter('filtro_profesores'));
        $entrada->validate($_POST, 'horarios', json_filter('filtro_horarios'));
        if($entrada->status( )){
            die(json_encode( crear_grupo_impl($conexion, $entrada->output('evaluacion'), $entrada->output('uea'), $entrada->output('clave'), $entrada->output('cupo'), $entrada->output('profesores' ), $entrada->output('horarios')) ));
        }

        $entrada = new input();
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('actualizar_grupo')));
        $entrada->validate($_POST, 'grupo', builtin_filter(FILTER_VALIDATE_INT));
        $entrada->validate($_POST, 'uea', builtin_filter(FILTER_VALIDATE_INT));
        $entrada->validate($_POST, 'clave', make_filter('is_string'));
        $entrada->validate($_POST, 'cupo', builtin_filter(FILTER_VALIDATE_INT));
        $entrada->validate($_POST, 'profesores', json_filter('filtro_profesores'));
        $entrada->validate($_POST, 'horarios', json_filter('filtro_horarios'));
        if($entrada->status( )){
            die(json_encode( actualizar_grupo_impl($conexion, $entrada->output('grupo'), $entrada->output('uea'), $entrada->output('clave'), $entrada->output('cupo'), $entrada->output('profesores' ), $entrada->output('horarios')) ));
        }

        $entrada = new input();
        $entrada->validate($_POST, 'servicio', make_filter(match_predicate('eliminar_grupo')));
        $entrada->validate($_POST, 'grupo', builtin_filter(FILTER_VALIDATE_INT));
        if($entrada->status( )){
            die(json_encode( eliminar_grupo_impl($conexion, $entrada->output('grupo')) ));
        }

        die(json_encode([ 'estado' => false, 'valor' => 'error_invocacion' ]));                
    } catch (Exception $ex) {                                                                 
        die(json_encode([ 'estado' => false, 'valor' => 'excepcion', 'mensaje' => $ex->getMessage( ) ]));
    }
    
   // filtros de datos de entrada

    function filtro_horarios($horarios) {
        if (is_array($horarios) && array_predicate(function(&$horario) {
           return (!isset($horario['salon']) || is_int($horario['salon'])) &&
                  isset($horario['dia']) && ($horario['dia'] === '' || array_predicate(fn($s) => in_array($s, [ 'LU', 'MA', 'MI', 'JU', 'VI' ]))(@explode(',', $horario['dia']))) &&
                  isset($horario['inicio']) && ($horario['inicio'] = @date_parse_from_format('H:i', $horario['inicio']))['error_count'] == 0 &&
                  isset($horario['termino']) && ($horario['termino'] = @date_parse_from_format('H:i', $horario['termino']))['error_count'] == 0 &&
                  mktime($horario['inicio']['hour'], $horario['inicio']['minute']) <= mktime($horario['termino']['hour'], $horario['termino']['minute']);
        })($horarios)) {
            return $horarios;
        }
    }

    function filtro_profesores($profesores){
        if (is_array($profesores) && array_predicate('is_int')($profesores)) {
            return $profesores;
        }
    }
    
   // funciones auxiliares

   function asocia_por($filas, $columna) {
      $res = [ ];
      foreach ($filas as $fila) {
         $clave = $fila[$columna];
         $res[$clave] = $fila;
      }
      return $res;
   }
   
   function agrupa_por($filas, $columna) {
      $res = [ ];
      foreach ($filas as $fila) {
         $clave = $fila[$columna];
         unset($fila[$columna]);
         $res[$clave][] = $fila;
      }
      return $res;
   }
   
   // implementación de casos de uso
   
    function listar_evaluaciones_impl($conexion){
        $actual = json_decode(file_get_contents("https://callix.azc.uam.mx/rcc/boligrama/scripts/trimestre.php"));
        $conexion->query('INSERT IGNORE INTO evaluaciones (trimestre, periodo, tipo) VALUES (?, ?, ?), (?, ?, ?)', $actual->anyo, $actual->periodo, 'GLO', $actual->anyo, $actual->periodo, 'REC');
        return [ 'estado' => true, 'valor' => $conexion->query('SELECT evaluacion, trimestre, periodo, tipo FROM evaluaciones') ];
    }
   
    function listar_grupos_impl($conexion, $evaluacion){
        list($dummy, $grupos, $profesores, $horarios) = $conexion->multi_query('
           CREATE TEMPORARY TABLE interes ENGINE=MEMORY AS SELECT grupo FROM grupos WHERE evaluacion = ?;
           SELECT grupo, uea, horas, clave, cupo FROM grupos JOIN ueas USING (uea) WHERE grupo IN (SELECT grupo FROM interes);
           SELECT grupo, profesor FROM profesores_grupo JOIN profesores USING (profesor) WHERE grupo IN (SELECT grupo FROM interes);
           SELECT grupo, salon, dia, TIME_FORMAT(inicio, "%H:%i") AS inicio, TIME_FORMAT(termino, "%H:%i") AS termino FROM horarios_grupo JOIN salones USING (salon) WHERE grupo IN (SELECT grupo FROM interes);
           DROP TEMPORARY TABLE interes;
        ', $evaluacion);
        
        $grupos = asocia_por($grupos, 'grupo');
        foreach (agrupa_por($profesores, 'grupo') as $id_grupo => $actual) {
           $grupos[$id_grupo]['profesores'] = array_column($actual, 'profesor');
        }
        foreach (agrupa_por($horarios, 'grupo') as $id_grupo => $actual) {
           $grupos[$id_grupo]['horarios'] = $actual;
        }
        return [ 'estado' => true, 'valor' => array_values($grupos) ];
    }

    function crear_grupo_impl($conexion, $evaluacion, $uea, $clave, $cupo, $profesores, $horarios){
        $conexion->query('INSERT IGNORE INTO grupos (uea, clave, evaluacion, cupo) VALUES (?, ?, ?, ?)', $uea, $clave, $evaluacion, $cupo);
        if(!$conexion->affected_rows){
            return ['estado' => false, 'valor' => 'duplicado'];
        }
        
        $id_grupo = $conexion->insert_id;      
        foreach($profesores as $id_profesor){
            $conexion->query('INSERT INTO profesores_grupo (grupo, profesor) VALUES (?, ?)', $id_grupo, $id_profesor);
        }
        foreach($horarios as $horario){
            $conexion->query('INSERT INTO horarios_grupo (grupo, salon, dia, inicio, termino) VALUES (?, ?, ?, ?, ?)', $id_grupo, $horario['salon'], $horario['dia'], $horario['inicio'], $horario['termino']);
        }
        return ['estado' => true, 'valor' => $id_grupo];
    }
    
    function actualizar_grupo_impl($conexion, $grupo, $uea, $clave, $cupo, $profesores, $horarios){
        $conexion->query('UPDATE grupos SET uea = ?, clave = ?, cupo = ? WHERE grupo = ?', $uea, $clave, $cupo, $grupo);
        if(!$conexion->affected_rows){
            return ['estado' => false, 'valor' => 'inexistente'];
        }

        $conexion->query('DELETE FROM profesores_grupo WHERE grupo = ?', $grupo); 
        $conexion->query('DELETE FROM horarios_grupo WHERE grupo = ?', $grupo);    
        foreach($profesores as $id_profesor){
            $conexion->query('INSERT INTO profesores_grupo (grupo, profesor) VALUES (?, ?)', $grupo, $id_profesor);
        }
        foreach($horarios as $horario){
            $conexion->query('INSERT INTO horarios_grupo (grupo, salon, dia, inicio, termino) VALUES (?, ?, ?, ?, ?)', $grupo, $horario['salon'], $horario['dia'], $horario['inicio'], $horario['termino']);
        }
        return ['estado' => true, 'valor' => null ];
    }
    
    function eliminar_grupo_impl($conexion, $grupo){
        $conexion->query('DELETE FROM grupos WHERE grupo = ?', $grupo);
        return ($conexion->affected_rows ? ['estado' => true, 'valor' => null] : ['estado' => false, 'valor' => 'inexistente']);
    } 
?>