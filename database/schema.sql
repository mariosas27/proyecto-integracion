DROP DATABASE IF EXISTS proyecto_integracion;
CREATE DATABASE proyecto_integracion;
USE proyecto_integracion;

CREATE TABLE profesores (
   profesor INT NOT NULL, 
   apellidos TEXT NOT NULL, 
   nombre TEXT NOT NULL, 
   email VARCHAR(254) DEFAULT NULL,
   departamento ENUM("CB", "EL", "EN", "MA", "SI") DEFAULT NULL,
   notas TEXT NOT NULL DEFAULT "",
   PRIMARY KEY (profesor)
);

CREATE TABLE ueas (
   uea INT NOT NULL, 
   nombre TEXT NOT NULL,
   horas DECIMAL(3, 1) NOT NULL, 
   PRIMARY KEY (uea)
);

CREATE TABLE salones (
   salon INT NOT NULL AUTO_INCREMENT,
   edificio VARCHAR(64) NOT NULL, 
   nombre VARCHAR(128) NOT NULL, 
   aforo100 SMALLINT DEFAULT NULL,
   aforo75 SMALLINT DEFAULT NULL,
   aforo50 SMALLINT DEFAULT NULL,
   PRIMARY KEY (salon),
   UNIQUE (nombre)
);

CREATE TABLE evaluaciones (
   evaluacion INT NOT NULL AUTO_INCREMENT,
   trimestre YEAR NOT NULL,
   periodo ENUM("I", "P", "O") NOT NULL,
   tipo ENUM("GLO", "REC") NOT NULL,
   PRIMARY KEY (evaluacion)
);

CREATE TABLE grupos (
   grupo INT NOT NULL AUTO_INCREMENT,
   uea INT NOT NULL, 
   clave VARCHAR(32) NOT NULL,
   evaluacion INT NOT NULL,
   PRIMARY KEY (grupo),
   UNIQUE (uea, clave, evaluacion),
   FOREIGN KEY (uea) REFERENCES ueas (uea) ON DELETE CASCADE,
   FOREIGN KEY (evaluacion) REFERENCES evaluaciones (evaluacion) ON DELETE CASCADE
);

CREATE TABLE horarios_grupo (
   grupo INT NOT NULL,
   salon INT DEFAULT NULL,
   dia ENUM("LU", "MA", "MI", "JU", "VI") DEFAULT NULL,
   inicio TIME DEFAULT NULL,
   termino TIME DEFAULT NULL,
   FOREIGN KEY (grupo) REFERENCES grupos (grupo) ON DELETE CASCADE,
   FOREIGN KEY (salon) REFERENCES salones (salon) ON DELETE CASCADE
);

CREATE TABLE profesores_grupo (
   grupo INT NOT NULL, 
   profesor INT DEFAULT NULL,
   UNIQUE (grupo, profesor),
   FOREIGN KEY (grupo) REFERENCES grupos (grupo) ON DELETE CASCADE,
   FOREIGN KEY (profesor) REFERENCES profesores (profesor) ON DELETE CASCADE
);
