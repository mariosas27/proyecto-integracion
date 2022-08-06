
// ----------------------------- SALONES -----------------------------
// los valores por defecto que contienen las funciones solo son colocados para realizar pruebas

async function lista_salones(){
    let res = await ajax_post(
                            "scripts/servicios.php", 
                            { "servicio": "listar_salones"},
                            1000);
    console.log(res);
}

async function actualiza_salon(salon = 107, edificio = 'AB', nombre = 'Salon Prueba', aforo100 = 45, aforo75 = 35, aforo50 = 25 ){
    let res = await ajax_post(
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


async function crea_salon(edificio = 'AAA', nombre = 'Salon Prueba AAB', aforo100 = 50, aforo75 = 35, aforo50 = 25 ){
    let res = await ajax_post(
                            "scripts/servicios.php", 
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
