<?php
    require_once('../includes/db_access.php');
    require_once('../database/auth.php');

    $file = fopen("salones.csv","r");
    $conexion = new db_access(HOST_DB, USER_DB, "1234", DATABASE_DB); //el password es el que tengo en mi entorno local
    while($fila = fgetcsv($file)){
        $conexion->query('INSERT IGNORE INTO salones (salon, edificio, nombre, aforo100, aforo75, aforo50) VALUES (?, ?, ?, ?, ?, ?)', null, $fila[0], $fila[1], $fila[2], $fila[3], $fila[4]);
    }
    fclose($file);

?>