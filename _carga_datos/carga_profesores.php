<?php
    require_once('../includes/db_access.php');
    require_once('../database/auth.php');

    $archivo = fopen("profesores.csv","r");
    $conexion = new db_access(HOST_DB, USER_DB, PASSWORD_DB, DATABASE_DB);
    $profesores = json_decode(file_get_contents('profesores.json'), true);
    
    fgetcsv($archivo);
    while ($fila = fgetcsv($archivo)){
        list($nombre, $eco, $email, $departamento) = array_map('trim', $fila);
        if (strlen($eco) != 0 && ctype_digit($eco)) {
           if (!isset($profesores[$eco])) {
              $profesores[$eco] = [ 'apellidos_nombres' => $nombre, 'email' => $email, 'departamento' => $departamento ];
           } else {
              $profesores[$eco] = array_merge($profesores[$eco], [ 'email' => $email, 'departamento' => $departamento ]);
           }
        } else {
           var_dump($fila); exit;
        }
    }
    
   foreach (file('separaciones_nombres.txt', FILE_IGNORE_NEW_LINES|FILE_SKIP_EMPTY_LINES) as $fila) {
      $fila = trim(preg_replace('/\s+/', ' ', $fila));
      list($eco, $apellidos_nombres) = explode(' ', $fila, 2);
      list($apellidos, $nombres) = explode('|', $apellidos_nombres);
      $profesores[$eco]['apellidos'] = $apellidos;
      $profesores[$eco]['nombres'] = $nombres;
   }
    
    foreach ($profesores as $eco => $profesor) {
        if (isset($profesor['email'])) {
            $profesor['email'] = filter_var($profesor['email'], FILTER_VALIDATE_EMAIL, FILTER_NULL_ON_FAILURE);
            $profesor['notas'] = '';
            if ($profesor['departamento'] == 'CIENCIAS BASICAS') {
                $profesor['departamento'] = 'CB';
            } else if ($profesor['departamento'] == 'ELECTRONICA') {
                $profesor['departamento'] = 'EL';
            } else if ($profesor['departamento'] == 'ENERGIA') {
                $profesor['departamento'] = 'EN';
            } else if ($profesor['departamento'] == 'MATERIALES') {
                $profesor['departamento'] = 'MA';
            } else if ($profesor['departamento'] == 'SISTEMAS') {
                $profesor['departamento'] = 'SI';
            } else {
                echo "departamento {$profesor['departamento']} desconocido\n";
                $profesor['notas'] = $profesor['departamento'];
                $profesor['departamento'] = null;
            }
            
            if (!isset($profesor['apellidos'])) {
               if ($profesor['apellidos_nombres'] == 'ALONSO NAVARRETE ARMANDO') {
                  $profesor['apellidos'] = 'ALONSO NAVARRETE';
                  $profesor['nombres'] = 'ARMANDO';
               } else if ($profesor['apellidos_nombres'] == 'MARTINEZ PEREZ JOSE ARMANDO') {
                  $profesor['apellidos'] = 'MARTINEZ PEREZ';
                  $profesor['nombres'] = 'JOSE ARMANDO';
               } else if ($profesor['apellidos_nombres'] == 'LOPEZ MONSALVO CESAR SIMON') {
                  $profesor['apellidos'] = 'LOPEZ MONSALVO';
                  $profesor['nombres'] = 'CESAR SIMON';
               } else if ($profesor['apellidos_nombres'] == 'BUSSY BEAURAIN ANNE-LAURE SABINE') {
                  $profesor['apellidos'] = 'BUSSY BEAURAIN';
                  $profesor['nombres'] = 'ANNE-LAURE SABINE';
               }
               if (!isset($profesor['apellidos'])) {
                  var_dump($profesor); exit;
               }
            }
            $conexion->query('INSERT IGNORE INTO profesores (profesor, apellidos, nombre, email, departamento, notas) VALUES (?, ?, ?, ?, ?, ?)', 
               $eco, $profesor['apellidos'], $profesor['nombres'], $profesor['email'], $profesor['departamento'], $profesor['notas']
            );
        }
    }
?>