
// ----------------------------- PROFESORES -----------------------------
// los valores por defecto que contienen las funciones solo son colocados para realizar pruebas

async function lista_profesores(){
    let res = await ajax_post(
        "scripts/profesores.php", 
        { "servicio": "listar_profesores"},
        1000);
    console.log(res);
}

async function actualiza_profesor(profesor = 1, apellidos = 'apellidos test', nombre = 'profesor x', email = 'profesx@azc.uam.mx', departamento = 'CB', notas = 'en proceso' ){
    let res = await ajax_post(
                            "scripts/profesores.php", 
                            {   "servicio": "actualizar_profesor",
                                "profesor": profesor, 
                                "apellidos": apellidos,
                                "nombre": nombre,
                                "email": email, 
                                "departamento": departamento, 
                                "notas": notas
                            },
                            1000);
    console.log(res);
}


async function crea_profesor(profesor = 1, apellidos = 'Apellido nuevo', nombre = 'Profesor nuevo', email = 'nuevo@azc.uam.mx', departamento = 'CB', notas = 'En revision' ){
    let res = await ajax_post(
                            "scripts/profesores.php", 
                            {   "servicio": "crear_profesor", 
                                "profesor": profesor,
                                "apellidos": apellidos,
                                "nombre": nombre,
                                "email": email, 
                                "departamento": departamento, 
                                "notas": notas
                            },
                            1000);
    console.log(res);
}

async function elimina_profesor(profesor = 1){
    let res = await ajax_post(
                            "scripts/profesores.php", 
                            {   "servicio": "eliminar_profesor",
                                "profesor": profesor
                            },
                            1000);
    console.log(res);
}