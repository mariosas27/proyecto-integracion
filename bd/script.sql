CREATE DATABASE PROYECTO_INTEGRACION;

USE PROYECTO_INTEGRACION;

CREATE TABLE profesores (
	numero_economico INT(10) NOT NULL, 
    apellido_paterno_profesor VARCHAR(50) NOT NULL, 
    apellido_materno_profesor VARCHAR(50) NOT NULL, 
    nombre_profesor VARCHAR(50) NOT NULL, 
	correo VARCHAR(50) NOT NULL,
    departamento ENUM('Ciencias Básicas', 'Electrónica', 'Energía', 'Materiales', 'Sistemas') NOT NULL,
    PRIMARY KEY (numero_economico)
  );
  
CREATE TABLE ueas (
	clave_uea INT(7) NOT NULL, 
    nombre_uea VARCHAR(50) NOT NULL,
    horas_de_clase DOUBLE NOT NULL, 
    PRIMARY KEY (clave_uea)
  );
  
  
CREATE TABLE salones (
	id_salon INT NOT NULL AUTO_INCREMENT,
    nombre_salon VARCHAR(50) NOT NULL, 
    aforo_verde INT NOT NULL, 
    aforo_amarillo INT NOT NULL, 
    aforo_rojo INT NOT NULL, 
    PRIMARY KEY (id_salon)
);  
  
  
CREATE TABLE evaluaciones (
	id_evaluacion INT NOT NULL AUTO_INCREMENT,
    trimestre YEAR NOT NULL,
    periodo ENUM('Invierno','Primavera', 'Otoño') NOT NULL,
    tipo ENUM ('Global', 'Recuperación') NOT NULL,
    PRIMARY KEY (id_evaluacion)
);

CREATE TABLE grupos (
	id_grupo INT NOT NULL AUTO_INCREMENT,
    uea INT(7) NOT NULL, 
    evaluacion INT NOT NULL,
    PRIMARY KEY (id_grupo),
    FOREIGN KEY (uea) REFERENCES ueas(clave_uea) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (evaluacion) REFERENCES evaluaciones(id_evaluacion) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE horarios_grupo (
	id_horario_grupo INT NOT NULL AUTO_INCREMENT, 
    grupo INT NOT NULL,
    salon INT NOT NULL,
    dia ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes') NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fin TIME NOT NULL,
    PRIMARY KEY (id_horario_grupo),
    FOREIGN KEY (grupo) REFERENCES grupos(id_grupo) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (salon) REFERENCES salones(id_salon) ON UPDATE CASCADE ON DELETE RESTRICT
);



CREATE TABLE profesores_grupo (
	id_profesores_grupo INT NOT NULL AUTO_INCREMENT,
    pg_grupo INT NOT NULL, 
    profesor INT(10) NOT NULL, 
    PRIMARY KEY (id_profesores_grupo),
    FOREIGN KEY (pg_grupo) REFERENCES grupos(id_grupo) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (profesor) REFERENCES profesores(numero_economico) ON UPDATE CASCADE ON DELETE RESTRICT
);
