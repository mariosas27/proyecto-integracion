
// ----------------------------- SALONES -----------------------------
// los valores por defecto que contienen las funciones solo son colocados para realizar pruebas

async function lista_salones(){
    let res = await peticion(ajax_post, 
                            "scripts/salones.php", 
                            { "servicio": "listar_salones"},
                            1000);
    console.log(res);
}

async function actualiza_salon(salon = 120, edificio = 'AB', nombre = 'Salon Prueba', aforo100 = 45, aforo75 = 35, aforo50 = 25 ){
    let res = await peticion(ajax_post, 
                            "scripts/salones.php", 
                            {   "servicio": "actualizar_salon",
                                "salon": salon, 
                                "edificio": edificio,
                                "nombre": nombre,
                                "aforo100": aforo100, 
                                "aforo75": aforo75, 
                                "aforo50": aforo50
                            },
                            1000);
    console.log(res);
}


async function crea_salon(edificio = 'ABAB', nombre = 'Salon Prueba ABAB', aforo100 = 50, aforo75 = 35, aforo50 = 25 ){
    let res = await peticion(ajax_post, 
                            "scripts/salones.php", 
                            {   "servicio": "crear_salon",
                                "edificio": edificio,
                                "nombre": nombre,
                                "aforo100": aforo100, 
                                "aforo75": aforo75, 
                                "aforo50": aforo50
                            },
                            1000);
    console.log(res);
}

async function elimina_salon(salon = 120){
    let res = await peticion(ajax_post, 
                            "scripts/salones.php", 
                            {   "servicio": "eliminar_salon",
                                "salon": salon
                            },
                            1000);
    console.log(res);
}