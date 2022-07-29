<?php
    require_once('../includes/db_access.php');
    require_once('../database/auth.php');

    $archivo = fopen("salones.csv","r");
    $conexion = new db_access(HOST_DB, USER_DB, PASSWORD_DB, DATABASE_DB);
    while($fila = fgetcsv($archivo)){
        $conexion->query('INSERT IGNORE INTO salones (edificio, nombre, aforo100, aforo75, aforo50) VALUES (?, ?, ?, ?, ?)', $fila[0], $fila[1], $fila[2], $fila[3], $fila[4]);
    }
?>