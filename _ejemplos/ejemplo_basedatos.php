<?php
   require_once('../database/auth.php');
   require_once('../includes/db_access.php');

   $conexion = new db_access(HOST_DB, USER_DB, PASSWORD_DB, DATABASE_DB);
   $conexion->query('INSERT IGNORE INTO ueas (uea, nombre, horas) VALUES (?, ?, ?)', 1151038, 'Programación Estructurada', 4.5);
   $conexion->query('INSERT IGNORE INTO ueas (uea, nombre, horas) VALUES (?, ?, ?)', 1151042, 'Algoritmos y Estructuras de Datos', 4.5);
   
   $filas = $conexion->query('SELECT uea, nombre, horas FROM ueas');
   foreach ($filas as $fila) {
      echo $fila['uea'], ' ', $fila['nombre'], ' ', $fila['horas'], "\n";
   }
?>