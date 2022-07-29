<?php
    require_once('../includes/db_access.php');
    require_once('../database/auth.php');

    $conexion = new db_access(HOST_DB, USER_DB, PASSWORD_DB, DATABASE_DB);
    foreach (glob('*_*.json') as $plan) {
       foreach (json_decode(file_get_contents($plan), true)['ueas'] as $uea) {
          $conexion->query('INSERT IGNORE INTO ueas (uea, nombre, horas) VALUES (?, ?, ?)', $uea['clave'], $uea['nombre'], $uea['teoria'] + $uea['practica']);
       }
    }
?>