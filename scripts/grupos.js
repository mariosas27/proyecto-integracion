let profesores = {}, salones = {}, ueas = {}, tabla_salones = new Map(), empalmes_salon = new Map();
async function inicializa(){
    let select_profesor = document.getElementById("entrada_profesor").content.querySelector("select[name=profesor]"), 
        select_salon = document.getElementById("entrada_horario").content.querySelector("select[name=salon]"), 
        select_uea = document.getElementById("select_ueas");
    for (let profesor of await lista_profesores()) {
        let option = document.createElement("option");
        option.innerText = `${profesor.profesor} ${profesor.nombre} ${profesor.apellidos}`;
        option.value = profesor.profesor;
        select_profesor.appendChild(option);
        profesores[profesor.profesor] = profesor;
    }
    for (let salon of await lista_salones()) {
        let option = document.createElement("option");
        option.innerText = salon.nombre;
        option.value = salon.salon;
        select_salon.appendChild(option);
        salones[salon.salon] = salon;
    }
    for (let uea of await lista_ueas()){
        let option = document.createElement("option");
        option.innerText = `${uea.uea} ${uea.nombre}`;
        option.value = uea.uea;
        select_uea.appendChild(option);
        ueas[uea.uea] = uea;
    }
   
    let vistos = new Set(), tabla = new Map();
    for(let evaluacion of (await lista_evaluaciones()).sort((a, b) => b.evaluacion - a.evaluacion)){
        tabla.set(`${evaluacion.trimestre}-${evaluacion.periodo}-${evaluacion.tipo}`, evaluacion.evaluacion);
        if(!vistos.has(`${evaluacion.trimestre}-${evaluacion.periodo}`)){
            vistos.add(`${evaluacion.trimestre}-${evaluacion.periodo}`);
            let opcion = document.createElement("option");
            opcion.value = opcion.innerText = `${evaluacion.trimestre}-${evaluacion.periodo}`;
            document.getElementById("trimestre_periodo").appendChild(opcion);
        }
    }
    (document.getElementById("trimestre_periodo").onchange = document.getElementById("tipo").onchange = function( ) {
       document.getElementById("evaluacion").value = tabla.get(`${document.getElementById("trimestre_periodo").value}-${document.getElementById("tipo").value}`);
       muestra_grupos();
    })( );
    for(let salon of Object.values(salones)){
        tabla_salones.set(salon.salon, new Map());
        for(let dia of ['LU','MA','MI','JU','VI']){
            tabla_salones.get(salon.salon).set(dia, new Map());
        }
    }
}

// =================== rutinas auxiliares de dibujo ====================

function dibuja_grupos(grupos) {
    document.getElementById("tabla_grupos_cuerpo").innerHTML = "";
    for(let grupo of grupos){
        dibuja_grupo(grupo);
    }
}

function redibuja_grupo(tr) {
    let datosDia = { "LU": "", "MA": "", "MI": "", "JU": "", "VI": "" };
    for (let horario of (tr.grupo.horarios ?? [ ])) {
       for (let dia of (horario.dia == "" ? [ ] : horario.dia.split(","))) {
          datosDia[dia] += `${salones[horario.salon].nombre}\n${horario.inicio} - ${horario.termino}\n`;
          inserta_tabla_salones(tr.grupo.grupo, tr.grupo.clave, horario.salon, dia, horario.inicio, horario.termino);
       }
    }
   
    for(let td of tr.childNodes) {
       if (td.className == "uea") {
          td.innerText = `${tr.grupo.uea} ${ueas[tr.grupo.uea].nombre}`;
       } else if (td.className == "profesores") {
          let texto = "";
          for(let profesor of (tr.grupo.profesores ?? [ ])){
              texto += `${profesor} ${profesores[profesor].nombre} ${profesores[profesor].apellidos}\n`;
          }
          td.innerText = texto;
       } else if (datosDia[td.className] != undefined) {
          td.innerText = datosDia[td.className];
       } else if (td.className != "") {
          td.innerText = tr.grupo[td.className];
       }
    }
    return tr;
}

function dibuja_grupo(grupo) {
    let tr = document.createElement("tr");
    tr.id = grupo.grupo, tr.grupo = grupo;
    for(let campo of [ "uea", "clave", "cupo", "profesores", "LU", "MA", "MI", "JU", "VI"]){
        let td = document.createElement("td");
        td.className = campo;
        tr.appendChild(td);
    }

    let btnActualiza = document.createElement("button"), tdActualiza = document.createElement("td");
    btnActualiza.onclick = ( ) => muestra_registro_grupo(tr.grupo);
    btnActualiza.classList.add("bx", "bx-edit-alt","edit_icon");
    tdActualiza.appendChild(btnActualiza);
    tr.appendChild(tdActualiza);

    let btnElimina = document.createElement("button"), tdElimina = document.createElement("td");
    btnElimina.onclick = ( ) => muestra_eliminacion_grupo(tr.grupo);
    btnElimina.classList.add("bx", "bx-x-circle","delete_icon");
    tdElimina.appendChild(btnElimina);
    tr.appendChild(tdElimina);

    document.getElementById("tabla_grupos_cuerpo").appendChild(tr);
    return redibuja_grupo(tr);
}

function dibuja_forma(grupo) {
    document.getElementById("forma_grupo").classList.remove("no_visible");
    document.getElementById("contenedor_busqueda").classList.add("no_visible");
    document.getElementById("contenedor_tabla").classList.add("no_visible");
    document.getElementById("contenedor_profesores").innerHTML = "";
    document.getElementById("contenedor_horarios").innerHTML = "";

    let forma = document.getElementById("forma_grupo"); forma.reset( );
    if (grupo == null) {
       forma.grupo.value = "";
    } else {
       for(let campo of ["grupo","uea", "clave", "cupo"]){
           forma[campo].value = grupo[campo];
       }
       for(let profesor of (grupo.profesores ?? [ ])) {
           dibuja_profesor(profesor);
       }
       for(let horario of (grupo.horarios ?? [ ])) {
           dibuja_horario(horario);
       }
    }
}

function oculta_forma() {
    document.getElementById("forma_grupo").classList.add("no_visible");
    document.getElementById("contenedor_busqueda").classList.remove("no_visible");
    document.getElementById("contenedor_tabla").classList.remove("no_visible");
}

function dibuja_profesor(valor = null){
    let nodo = document.getElementById("entrada_profesor").content.cloneNode(true);
    nodo.querySelector("select[name=profesor]").value = valor;
    document.getElementById("contenedor_profesores").appendChild(nodo);
}

function dibuja_horario(valor = null){
    let nodo = document.getElementById("entrada_horario").content.cloneNode(true);
    nodo.querySelector("select[name=salon]").value = valor?.salon;
    for (let cb of nodo.querySelectorAll("input[name=dia]")) {
       cb.checked = (valor?.dia ?? "").includes(cb.value);
    }
    nodo.querySelector("input[name=inicio]").value = valor?.inicio;
    nodo.querySelector("input[name=termino]").value = valor?.termino;
    document.getElementById("contenedor_horarios").appendChild(nodo);
}

// =================== consultar, agregar, actualizar y eliminar ====================

async function muestra_grupos( ){
    dibuja_grupos(await lista_grupos(document.getElementById("evaluacion").value));
    console.table(tabla_salones.get(1))
    console.log(empalmes_salon);
}

async function muestra_registro_grupo(grupo = null){
    dibuja_forma(grupo);
}

function muestra_eliminacion_grupo(grupo) {
    if (confirm(`¿Está seguro de eliminar grupo ${grupo.nombre}`)) {
       ejecuta_eliminacion_grupo(grupo);
    }
}

function cancela_registro_grupo(){
    oculta_forma();
}
 
async function ejecuta_registro_grupo(forma){
    if(forma.reportValidity()){
        function agrupa_profesores(forma){
            return Array.from(forma.querySelectorAll("select[name=profesor]")).map((entrada) => parseInt(entrada.value));
        }
        function agrupa_horarios(forma){
            function* chunks(arr, n) {
               for (let i = 0; i < arr.length; i += n) {
                  yield arr.slice(i, i + n);
               }
            }

            let salones = Array.from(forma.querySelectorAll("select[name=salon]")).map((entrada) => (entrada.value != "" ? parseInt(entrada.value) : null));
            let dias = [ ...chunks(Array.from(forma.querySelectorAll("input[name=dia]")), 5) ].map((cbs) => cbs.filter((cb) => cb.checked).map((cb) => cb.value).join(","));
            let inicios = Array.from(forma.querySelectorAll("input[name=inicio]")).map((entrada) => entrada.value);
            let terminos = Array.from(forma.querySelectorAll("input[name=termino]")).map((entrada) => entrada.value);
            let res = [ ];
            for (let i = 0; i < salones.length; ++i) {
               res.push({ "salon": salones[i], "dia": dias[i], "inicio": inicios[i], "termino": terminos[i] });
            }
            return res;
        }
        
        let datos = Object.fromEntries((new FormData(forma)).entries());
        datos.profesores = agrupa_profesores(forma);
        datos.horarios = agrupa_horarios(forma);
        if (forma.grupo.value == "") {
           datos.grupo = await crea_grupo(document.getElementById("evaluacion").value, datos.uea, datos.clave, datos.profesores, datos.horarios, datos.cupo);
           alert("Se agregó el grupo exitosamente.");
           dibuja_grupo(datos).focus();
        } else {
           await actualiza_grupo(datos.grupo, datos.uea, datos.clave, datos.profesores, datos.horarios, datos.cupo);
           alert("Se actualizó el grupo exitosamente.");
           let tr = document.getElementById(datos.grupo);
           tr.grupo = datos, redibuja_grupo(tr).focus();
        }
        cancela_registro_grupo();
        document.getElementById(datos.grupo).classList.add("success_update");
    }
}

async function ejecuta_eliminacion_grupo(grupo) {
    await elimina_grupo(grupo.grupo);
    document.getElementById(grupo.grupo).remove( );
}

function inserta_tabla_salones(grupo, nombre_grupo, salon, dia, inicio, termino) {
    for (let aux_grupo of tabla_salones.get(salon).get(dia).keys()) {
        if(!check_empalme(tabla_salones.get(salon).get(dia).get(aux_grupo).inicio, tabla_salones.get(salon).get(dia).get(aux_grupo).termino, inicio, termino)){
            if(!empalmes_salon.has(grupo)){
                empalmes_salon.set(grupo, []);
            }
            empalmes_salon.get(grupo).push(`Empalme con ${tabla_salones.get(salon).get(dia).get(aux_grupo).nombre} -> Día ${dia}, horario: ${inicio} - ${termino}`);
            if(!empalmes_salon.has(aux_grupo)){
                empalmes_salon.set(aux_grupo, []);
            }
            empalmes_salon.get(aux_grupo).push(`Empalme con ${tabla_salones.get(salon).get(dia).get(aux_grupo).nombre} -> Día ${dia}, horario: ${inicio} - ${termino}`);
        }
    }
    tabla_salones.get(salon).get(dia).set(grupo, {nombre: nombre_grupo, inicio: inicio, termino: termino})
  }

function check_empalme(time1_inicio, time1_fin, time2_inicio, time2_fin){
    const [hours1_inicio, minutes1_inicio] = time1_inicio.split(':');
    const [hours1_fin, minutes1_fin] = time1_fin.split(':');

    const [hours2_inicio, minutes2_inicio] = time2_inicio.split(':');
    const [hours2_fin, minutes2_fin] = time2_fin.split(':');

    const date1_inicio = new Date(2022, 0, 1, +hours1_inicio, +minutes1_inicio);
    const date1_fin = new Date(2022, 0, 1, +hours1_fin, +minutes1_fin);

    const date2_inicio = new Date(2022, 0, 1, +hours2_inicio, +minutes2_inicio);
    const date2_fin = new Date(2022, 0, 1, +hours2_fin, +minutes2_fin);

    return (date2_inicio.getTime() >= date1_fin.getTime() && date2_fin.getTime() > date1_fin.getTime()) || 
        (date1_inicio.getTime() >= date2_fin.getTime() && date1_fin.getTime() > date2_fin.getTime());
}