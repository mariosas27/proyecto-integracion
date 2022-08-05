
// ----------------------------- UEAS -----------------------------

async function lista_ueas(){
    let res = await ajax_post(
                            "scripts/servicios.php", 
                            { "servicio": "listar_ueas"},
                            1000);
    console.log(res);
}



// ----------------------------- SALONES -----------------------------

async function lista_salones(){
    let res = await ajax_post(
                            "scripts/servicios.php", 
                            { "servicio": "listar_salones"},
                            1000);
    console.log(res);
}

async function actualiza_salon(salon = 107, edificio = 'A', nombre = 'Salon Prueba', aforo100 = 45, aforo75 = 35, aforo50 = 25 ){
    let res = await ajax_post(
                            "scripts/servicios.php", 
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


async function crea_salon(edificio = 'AA', nombre = 'Salon Prueba AA', aforo100 = 50, aforo75 = 35, aforo50 = 25 ){
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


// ----------------------------- PROFESORES -----------------------------

async function lista_profesores(){
    let res = await ajax_post(
        "scripts/servicios.php", 
        { "servicio": "listar_profesores"},
        1000);
    console.log(res);
}


async function actualiza_profesor(profesor = 1, apellidos = 'apellidos test', nombre = 'profesor x', email = 'profesx@azc.uam.mx', departamento = 'CB', notas = 'en proceso' ){
    let res = await ajax_post(
                            "scripts/servicios.php", 
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
                            "scripts/servicios.php", 
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











// --------------------------- manipulacion del dom --------------------------- 
const contenedor_ueas = document.getElementById('contenedor-ueas');


async function lista_ueas_tabla(){
    let res = await ajax_post(
                            "scripts/servicios.php", 
                            { "servicio": "listar_ueas"},
                            1000);
    console.log(res);
    muestra_ueas(res);
}




function muestra_ueas(ueas){
    const tabla = document.createElement('table');
    const encabezados = document.createElement('tr');

    encabezados.innerHTML = `
        <th>Clave uea</th>
        <th>Nombre</th>
        <th>Horas</th>
    `;
    
    tabla.appendChild(encabezados);

    ueas.valor.forEach( uea => {
        const fila = document.createElement('tr');

        fila.innerHTML = `
            <td> ${uea.uea} </td>
            <td> ${uea.nombre} </td>
            <td> ${uea.horas} </td>    
        `;
        
        
        
        tabla.appendChild(fila);
    });
    contenedor_ueas.appendChild(tabla);
}