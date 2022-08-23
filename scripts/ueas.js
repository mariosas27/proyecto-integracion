// =================== rutinas auxiliares de dibujo ====================

function redibuja_uea(tr) {
    for(let td of tr.childNodes) {
       if (td.className != null && tr.uea[td.className] !== undefined) {
          td.innerText = tr.uea[td.className];
       }
    }
 }
 
 function dibuja_uea(uea) {
    let tr = document.createElement("tr");
    tr.id = uea.uea, tr.uea = uea;
    for(let campo of [ "uea", "nombre", "horas"]){
        let td = document.createElement("td");
        td.className = campo;
        tr.appendChild(td);
    }
    redibuja_uea(tr);
    document.getElementById("tabla_ueas_cuerpo").appendChild(tr);
 }
  
 // =================== consultar, agregar, actualizar y eliminar ====================
 
async function muestra_ueas( ) {
    for(let uea of await lista_ueas( )){
        dibuja_uea(uea);
    }
 }
 
 // =================== buscar ====================
 
 function filtra_ueas( ) {
    let valor = document.getElementById("busqueda").value.replace(/\s+/, " ").toUpperCase( ), tipo = document.getElementById("tipo_filtro").value;
    for (let td of document.getElementById("tabla_ueas_cuerpo").getElementsByClassName(tipo)) {
        td.parentNode.style.display = (td.innerText.toUpperCase( ).includes(valor) ? "" : "none");      
    }
 }