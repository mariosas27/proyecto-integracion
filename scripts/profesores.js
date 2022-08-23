// =================== rutinas auxiliares de dibujo ====================

function redibuja_profesor(tr) {
    for(let td of tr.childNodes) {
       if (td.className != "") {
          td.innerText = tr.profesor[td.className];
       }
    }
 }
 
 function dibuja_profesor(profesor) {
     let tr = document.createElement("tr");
     tr.id = profesor.profesor, tr.profesor = profesor;
     for(let campo of [ "profesor", "nombre", "apellidos", "email", "departamento", "notas"]){
         let td = document.createElement("td");
         td.className = campo;
         tr.appendChild(td);
     }
     redibuja_profesor(tr);
     
     let btnActualiza = document.createElement("button"), tdActualiza = document.createElement("td");
     btnActualiza.onclick = ( ) => muestra_actualizacion_profesor(tr.profesor);
     btnActualiza.classList.add("bx", "bx-edit-alt","edit_icon");
     tdActualiza.appendChild(btnActualiza);
     tr.appendChild(tdActualiza);
 
     let btnElimina = document.createElement("button"), tdElimina = document.createElement("td");
     btnElimina.onclick = ( ) => muestra_eliminacion_profesor(tr.profesor);
     btnElimina.classList.add("bx", "bx-x-circle","delete_icon");
     tdElimina.appendChild(btnElimina);
     tr.appendChild(tdElimina);
 
    document.getElementById("tabla_profesores_cuerpo").appendChild(tr);
 }
 
 function dibuja_forma(forma, profesor = null) {
     document.getElementById("contenedor_busqueda").classList.add("no_visible");
     document.getElementById("contenedor_tabla").classList.add("no_visible");
     forma.classList.remove("no_visible");
     forma.reset( );
     for(let campo in (profesor ?? { })) {
        forma[campo].value = profesor[campo];
     }
 }
 
 function oculta_forma(forma) {
     document.getElementById("contenedor_busqueda").classList.remove("no_visible");
     document.getElementById("contenedor_tabla").classList.remove("no_visible");
     forma.classList.add("no_visible");
 }
 
 // =================== consultar, agregar, actualizar y eliminar ====================
 
 async function muestra_profesores( ) {
     for(let profesor of await lista_profesores( )){
        dibuja_profesor(profesor);
     }
 }
 
 function muestra_creacion_profesor( ) {
     dibuja_forma(document.getElementById("forma_creacion"));
 }
 
 function muestra_actualizacion_profesor(profesor) {
     dibuja_forma(document.getElementById("forma_actualizacion"), profesor);
 }
 
 function muestra_eliminacion_profesor(profesor) {
     if (confirm(`¿Está seguro de eliminar al profesor ${profesor.nombre} ${profesor.apellidos}?`)) {
        ejecuta_eliminacion_profesor(profesor);
     }
 }
 
 function cancela_creacion_profesor( ) {
     oculta_forma(document.getElementById("forma_creacion"));
 }
 
 function cancela_actualizacion_profesor() {
     oculta_forma(document.getElementById("forma_actualizacion"));
 }
 
 async function ejecuta_creacion_profesor(forma) {
    if (forma.reportValidity( )) {
       let datos = Object.fromEntries((new FormData(forma)).entries( ));
       let profesor = Object.assign({ "profesor": await crea_profesor(datos.profesor, datos.apellidos, datos.nombre, datos.email, datos.departamento, datos.notas) }, datos);
       alert("Se agregó el profesor exitosamente.");
       cancela_creacion_profesor( );
       dibuja_profesor(profesor);
    }
 }
 
 async function ejecuta_actualizacion_profesor(forma) {
    if (forma.reportValidity( )) {
       let datos = Object.fromEntries((new FormData(forma)).entries( ));
       await actualiza_profesor(datos.profesor, datos.apellidos, datos.nombre, datos.email, datos.departamento, datos.notas);
       alert("Se actualizó el salón exitosamente.");
       let tr = document.getElementById(datos.profesor);
       tr.profesor = datos, redibuja_profesor(tr);
       cancela_actualizacion_profesor();
    }
 }
 
 async function ejecuta_eliminacion_profesor(profesor) {
     await elimina_profesor(profesor.profesor);
     alert("Se eliminó el profesor exitosamente.");
     document.getElementById(profesor.profesor).remove( );
 }
 
 // =================== buscar ====================
 
 function filtra_profesores( ) {
     let valor = document.getElementById("busqueda").value.replace(/\s+/, " ").toUpperCase( ), tipo = document.getElementById("tipo_filtro").value;
     for (let td of document.getElementById("tabla_profesores_cuerpo").getElementsByClassName(tipo)) {
        td.parentNode.style.display = (td.innerText.toUpperCase( ).includes(valor) ? "" : "none");      
     }
 }