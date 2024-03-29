let profesores = {}, salones = {}, ueas = {}, grupos = {};

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
    (document.getElementById("trimestre_periodo").onchange = document.getElementById("tipo").onchange = async function( ) {
       document.getElementById("evaluacion").value = tabla.get(`${document.getElementById("trimestre_periodo").value}-${document.getElementById("tipo").value}`);
       document.getElementById("tabla_grupos_cuerpo").innerHTML = "";
       for (let grupo of await lista_grupos(document.getElementById("evaluacion").value)) {
          dibuja_grupo(grupo, false);
          grupos[grupo.grupo] = grupo;
       }
       verifica_inconsistencias();
    })( );
}

// =================== rutinas auxiliares de dibujo ====================

function redibuja_alertas(inconsistencias){    
    let mensajes = { };
    for (let [tipo_recurso, leyenda] of [ [ "salon", "salón" ], [ "profesor", "profesor" ] ]) {
       for (let grupo in inconsistencias[tipo_recurso]) {
          mensajes[grupo] = (mensajes[grupo] ?? [ ]);
          mensajes[grupo].push(`Empalme de ${leyenda} con\n` + [ ...new Set(inconsistencias[tipo_recurso][grupo]) ].map((grupo) => `   ${grupos[grupo].clave} de ${grupos[grupo].uea} ${ueas[grupos[grupo].uea].nombre}`).join("\n"));
       }
    }
    for(let grupo in inconsistencias["sobrecupo"]){
      mensajes[grupo] = (mensajes[grupo] ?? [ ]);
      inconsistencias["sobrecupo"][grupo].forEach( salon => mensajes[grupo].push(`Sobrecupo en el salón ${salon}`) );
    }
    for (let tr of Array.from(document.getElementsByClassName("con_alerta"))) {
       tr.classList.remove("con_alerta");
       tr.getElementsByClassName("alerta")[0].onclick = null;
    }
    for (let grupo in mensajes) {
       mensajes[grupo] = mensajes[grupo].join("\n");
       let tr = document.getElementById(grupo);
       tr.classList.add("con_alerta");
       tr.getElementsByClassName("alerta")[0].onclick = () => alert(mensajes[grupo]);
    }
}

function redibuja_grupo(grupo, focus) {
    let datosDia = { "LU": "", "MA": "", "MI": "", "JU": "", "VI": "" };
    for (let horario of (grupo.horarios ?? [ ])) {
       for (let dia of (horario.dia == "" ? [ ] : horario.dia.split(","))) {
          datosDia[dia] += `${salones[horario.salon].nombre}\n${horario.inicio} - ${horario.termino}\n`;
       }
    }
   
    let tr = document.getElementById(grupo.grupo);
    for(let td of tr.childNodes) {
       if (td.className == "uea") {
          td.innerText = `${grupo.uea} ${ueas[grupo.uea].nombre}`;
       } else if (td.className == "profesores") {
          let texto = "";
          for(let profesor of (grupo.profesores ?? [ ])){
              texto += `${profesor} ${profesores[profesor].nombre} ${profesores[profesor].apellidos}\n`;
          }
          td.innerText = texto;
       } else if (datosDia[td.className] != undefined) {
          td.innerText = datosDia[td.className];
       } else if (td.className != "") {
          td.innerText = grupo[td.className];
       }
    }
    if (focus) {
       tr.focus();
    }
}

function dibuja_grupo(grupo, focus) {
    let tr = document.createElement("tr");
    tr.id = grupo.grupo;
    for(let campo of [ "uea", "clave", "cupo", "profesores", "LU", "MA", "MI", "JU", "VI"]){
        let td = document.createElement("td");
        td.className = campo;
        tr.appendChild(td);
    }
    
    let imagenAlerta = document.createElement("img");
    imagenAlerta.classList.add("alerta");
    tr.appendChild(imagenAlerta);

    let btnActualiza = document.createElement("button"), tdActualiza = document.createElement("td");
    btnActualiza.onclick = ( ) => muestra_registro_grupo(grupos[tr.id]);
    btnActualiza.classList.add("bx", "bx-edit-alt","edit_icon");
    tdActualiza.appendChild(btnActualiza);
    tr.appendChild(tdActualiza);

    let btnElimina = document.createElement("button"), tdElimina = document.createElement("td");
    btnElimina.onclick = ( ) => muestra_eliminacion_grupo(grupos[tr.id]);
    btnElimina.classList.add("bx", "bx-x-circle","delete_icon");
    tdElimina.appendChild(btnElimina);
    tr.appendChild(tdElimina);

    document.getElementById("tabla_grupos_cuerpo").appendChild(tr);
    redibuja_grupo(grupo, focus);
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

async function muestra_registro_grupo(grupo = null){
    dibuja_forma(grupo);
}

function muestra_eliminacion_grupo(grupo) {
    if (confirm(`¿Está seguro de eliminar grupo ${grupo.clave}`)) {
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
           datos.grupo = forma.grupo.value = await crea_grupo(document.getElementById("evaluacion").value, datos.uea, datos.clave, datos.profesores, datos.horarios, datos.cupo);
           alert("Se agregó el grupo exitosamente.");
           dibuja_grupo(datos, true);
        } else {
           await actualiza_grupo(datos.grupo, datos.uea, datos.clave, datos.profesores, datos.horarios, datos.cupo);
           alert("Se actualizó el grupo exitosamente.");
           redibuja_grupo(datos, true);
        }
        grupos[datos.grupo] = datos, verifica_inconsistencias();
        document.getElementById(datos.grupo).classList.add("success_update");
    }
}

async function ejecuta_eliminacion_grupo(grupo) {
    await elimina_grupo(grupo.grupo);
    actualiza_tablas_empalmes(grupo.grupo);
    document.getElementById(grupo.grupo).remove( );
}

function verifica_inconsistencias() {
   function marca_tiempo(tiempo) {
      let [hora, minuto] = tiempo.split(':').map((v) => parseInt(v));
      return 60 * hora + minuto;
   }
   function accesa_crea(obj, ...indices) {
      for (let i = 0; i < indices.length; obj = obj[indices[i++]]) {
         if (obj[indices[i]] == undefined) {
            obj[indices[i]] = (i + 1 < indices.length ? { } : [ ]);
         }
      }
      return obj;
   }

   let trabajo = { "salon": { }, "profesor": { } };
   for (let grupo in grupos) {
      for (let horario of grupos[grupo].horarios) {
         if (horario.salon != null) {
            for(let dia of ['LU','MA','MI','JU','VI']) {
               if (horario.dia.includes(dia)) {
                  accesa_crea(trabajo.salon, horario.salon, dia).push([ marca_tiempo(horario.inicio), +grupo ]);
                  accesa_crea(trabajo.salon, horario.salon, dia).push([ marca_tiempo(horario.termino), -grupo ]);
                  for (let profesor of (grupos[grupo].profesores ?? [ ])) {
                     accesa_crea(trabajo.profesor, profesor, dia).push([ marca_tiempo(horario.inicio), +grupo ]);
                     accesa_crea(trabajo.profesor, profesor, dia).push([ marca_tiempo(horario.termino), -grupo ]);
                  }
               }
            }            
         }
      }
   }

   let empalmes = { };
   for (let tipo_recurso in trabajo) {
      for (let recurso in trabajo[tipo_recurso]) {
         for (let dia in trabajo[tipo_recurso][recurso]) {
            trabajo[tipo_recurso][recurso][dia].sort((a, b) => (a[0] != b[0] ? a[0] - b[0] : a[0] - b[0]));
            let activos = new Set( );
            for (let dato of trabajo[tipo_recurso][recurso][dia]) {
               if (dato[1] > 0) {
                  activos.add(dato[1]);
                  if (activos.size > 1) {
                     for (let otro of activos) {
                        if (otro != dato[1]) {
                           accesa_crea(empalmes, tipo_recurso, dato[1]).push(otro);
                           accesa_crea(empalmes, tipo_recurso, otro).push(dato[1]);
                        }
                     }
                  }
               } else {
                  activos.delete(dato[1]);
               }
            }
         }
      }
   }
   for(let grupo in grupos){
      grupos[grupo]['horarios'].forEach( horario => {
         if(grupos[grupo].cupo > salones[horario.salon]['aforo100']){
            accesa_crea(empalmes, 'sobrecupo', grupo).push(salones[horario.salon].nombre);
         }
      });  
  }
   redibuja_alertas(empalmes);
}

function exportar() {
   let datos = [ ];
   datos.push(Array.from(document.getElementsByClassName("tabla_head")[0].getElementsByClassName("exportar")).map((th) => th.innerText));
   for (let tr of document.getElementById("tabla_grupos_cuerpo").getElementsByTagName("tr")) {
      datos.push(Array.from(tr.getElementsByTagName("td")).map((td) => td.innerText).slice(0, datos[0].length));
   }
   download_blob(array2csv(datos), `${document.getElementById("trimestre_periodo").value}-${document.getElementById("tipo").value}.csv`, csv_datatype( ));
}
