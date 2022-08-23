// =================== rutinas auxiliares de dibujo ====================

function redibuja_salon(tr) {
   for(let td of tr.childNodes) {
      if (td.className != "") {
         td.innerText = tr.salon[td.className];
      }
   }
}

function dibuja_salon(salon) {
    let tr = document.createElement("tr");
    tr.id = salon.salon, tr.salon = salon;
    for(let campo of [ "edificio", "nombre", "aforo100", "aforo75", "aforo50"]){
        let td = document.createElement("td");
        td.className = campo;
        tr.appendChild(td);
    }
    redibuja_salon(tr);
    
    let btnActualiza = document.createElement("button"), tdActualiza = document.createElement("td");
    btnActualiza.onclick = ( ) => muestra_actualizacion_salon(tr.salon);
    btnActualiza.classList.add("bx", "bx-edit-alt","edit_icon");
    tdActualiza.appendChild(btnActualiza);
    tr.appendChild(tdActualiza);

    let btnElimina = document.createElement("button"), tdElimina = document.createElement("td");
    btnElimina.onclick = ( ) => muestra_eliminacion_salon(tr.salon);
    btnElimina.classList.add("bx", "bx-x-circle","delete_icon");
    tdElimina.appendChild(btnElimina);
    tr.appendChild(tdElimina);

    document.getElementById("tabla_salones_cuerpo").appendChild(tr);
}

function dibuja_forma(forma, salon = null) {
    document.getElementById("contenedor_busqueda").classList.add("no_visible");
    document.getElementById("contenedor_tabla").classList.add("no_visible");
    forma.classList.remove("no_visible");
    forma.reset( );
    for(let campo in (salon ?? { })) {
       forma[campo].value = salon[campo];
    }
}

function oculta_forma(forma) {
    document.getElementById("contenedor_busqueda").classList.remove("no_visible");
    document.getElementById("contenedor_tabla").classList.remove("no_visible");
    forma.classList.add("no_visible");
}

// =================== consultar, agregar, actualizar y eliminar ====================

async function muestra_salones( ) {
    for(let salon of await lista_salones( )){
       dibuja_salon(salon);
    }
}

function muestra_creacion_salon( ) {
    dibuja_forma(document.getElementById("forma_creacion"));
}

function muestra_actualizacion_salon(salon) {
    dibuja_forma(document.getElementById("forma_actualizacion"), salon);
}

function muestra_eliminacion_salon(salon) {
    if (confirm(`¿Está seguro de eliminar el salón ${salon.nombre}?`)) {
       ejecuta_eliminacion_salon(salon);
    }
}

function cancela_creacion_salon( ) {
    oculta_forma(document.getElementById("forma_creacion"));
}

function cancela_actualizacion_salon(salon) {
    oculta_forma(document.getElementById("forma_actualizacion"));
}

async function ejecuta_creacion_salon(forma) {
   if (forma.reportValidity( )) {
      let datos = Object.fromEntries((new FormData(forma)).entries( ));
      let salon = Object.assign({ "salon": await crea_salon(datos.edificio, datos.nombre, datos.aforo100, datos.aforo75, datos.aforo50) }, datos);
      alert("Se agregó el salón exitosamente.");
      cancela_creacion_salon( );
      dibuja_salon(salon);
   }
}

async function ejecuta_actualizacion_salon(forma) {
   if (forma.reportValidity( )) {
      let datos = Object.fromEntries((new FormData(forma)).entries( ));
      await actualiza_salon(datos.salon, datos.edificio, datos.nombre, datos.aforo100, datos.aforo75, datos.aforo50);
      alert("Se actualizó el salón exitosamente.");
      let tr = document.getElementById(datos.salon);
      tr.salon = datos, redibuja_salon(tr);
      cancela_actualizacion_salon();
   }
}

async function ejecuta_eliminacion_salon(salon) {
    await elimina_salon(salon.salon);
    alert("Se eliminó el salón exitosamente.");
    document.getElementById(salon.salon).remove( );
}

// =================== buscar ====================

function filtra_salones( ) {
    let valor = document.getElementById("busqueda").value.replace(/\s+/, " ").toUpperCase( ), tipo = document.getElementById("tipo_filtro").value;
    for (let td of document.getElementById("tabla_salones_cuerpo").getElementsByClassName(tipo)) {
       td.parentNode.style.display = (td.innerText.toUpperCase( ).includes(valor) ? "" : "none");      
    }
}