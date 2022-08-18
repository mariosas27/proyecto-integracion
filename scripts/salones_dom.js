// ======================== controladores ==============================

window.addEventListener('load', prepara_lista_salones);

async function prepara_lista_salones(){
    let salones =  await lista_salones(); 
    muestra_salones(salones);
    return salones;
}



async function controlador_elimina_salon(e){
    e.preventDefault();
    let opcion = confirm(`¿Está seguro de eliminar el salón ${e.target.id}?`);
    if(opcion){
        await elimina_salon(e.target.id);
        limpiar_tabla();
    }
}   


async function controlador_crea_salon(e){
    e.preventDefault();
    
    
    let edificio = document.getElementById("edificio").value;
    let nombre = document.getElementById("nombre").value;
    let aforo100 = document.getElementById("aforo100").value;
    let aforo75 = document.getElementById("aforo75").value;
    let aforo50 = document.getElementById("aforo50").value;
    

    if(!validaForm(edificio, nombre, aforo100, aforo75, aforo50)){
        return;
    }
    let res = await crea_salon(edificio, nombre, aforo100, aforo75, aforo50);
    
    if(!isNaN(res)){
        limpiar_tabla();
        document.getElementById("register_form").reset();
        alert("Se ha agregado el salón");
    }else{
        alert("Salón no agregado, revisa que todos los datos sean correctos y que no esté duplicado");
    }
    
}



async function controlador_actualiza_salon(e){
    e.preventDefault();   
    let salon = document.getElementById("actualiza_salon").value;
    let edificio = document.getElementById("actualiza_edificio").value;
    let nombre = document.getElementById("actualiza_nombre").value;
    let aforo100 = document.getElementById("actualiza_aforo100").value;
    let aforo75 = document.getElementById("actualiza_aforo75").value;
    let aforo50 = document.getElementById("actualiza_aforo50").value;
    

    if(!validaForm(edificio, nombre, aforo100, aforo75, aforo50)){
        return;
    }
    let res = await actualiza_salon(salon, edificio, nombre, aforo100, aforo75, aforo50);
    console.log("resultado: ", res);
    
    if(res === null){
        limpiar_tabla();
        document.getElementById("register_form").reset();
        alert("Se ha actualizó el salón");
        document.getElementById("table_container").classList.remove("no_visible");
        document.getElementById("actualiza_form").classList.add("no_visible");
    }else{
        alert("Salón no actualizado, revisa que todos los datos sean correctos");
    }

}


// ======================= mostrar contenido ===========================



function muestra_salones(salones){
    for(let salon of salones){
        let tr = document.createElement('tr');
        for(let campo of ["salon", "edificio", "nombre", "aforo100", "aforo75", "aforo50"]){
            let td = document.createElement('td');
            td.innerText = salon[campo];
            tr.appendChild(td);
        }
        //Icono de eliminar y actualizar

        let tdActualiza = document.createElement('td');
        let btnActualiza = document.createElement('button');
        btnActualiza.setAttribute("id", salon.salon);
        btnActualiza.setAttribute("onclick", "muestra_actualiza_form(event)");
        btnActualiza.classList.add("bx", "bx-edit-alt","edit_icon");
        tdActualiza.appendChild(btnActualiza);

        tr.appendChild(tdActualiza);

        let tdElimina = document.createElement('td');
        let btnElimina = document.createElement('button');
        btnElimina.setAttribute("id", salon.salon);
        btnElimina.setAttribute("onclick", "controlador_elimina_salon(event)");
        btnElimina.classList.add("bx", "bx-x-circle","delete_icon");
        tdElimina.appendChild(btnElimina);

        tr.appendChild(tdElimina);

        document.getElementById("tabla_body").appendChild(tr);
    }
}


function muestra_crea_form(e){
    e.preventDefault();
    if(e.target.id === "agrega_salon"){
        document.getElementById("register_form").classList.remove("no_visible");
        
        document.getElementById("cancelar_agrega_salon").classList.remove("no_visible");

        document.getElementById("agrega_salon").classList.add("no_visible");
        document.getElementById("busqueda").classList.add("no_visible");
        document.getElementById("tipo_filtro").classList.add("no_visible");

    }else{
        document.getElementById("register_form").reset();

        document.getElementById("register_form").classList.add("no_visible");
        
        document.getElementById("cancelar_agrega_salon").classList.add("no_visible");

        document.getElementById("agrega_salon").classList.remove("no_visible");

        document.getElementById("busqueda").classList.remove("no_visible");
        document.getElementById("tipo_filtro").classList.remove("no_visible");
    }
    
}


function muestra_actualiza_form(e){
    e.preventDefault();
    if(e.target.id !== "cancela_actulizar"){
        document.getElementById("table_container").classList.add("no_visible");
        document.getElementById("actualiza_form").classList.remove("no_visible");
        document.getElementById("busqueda").classList.add("no_visible");
        document.getElementById("tipo_filtro").classList.add("no_visible");
        document.getElementById("agrega_salon").classList.add("no_visible");

        let parent = e.target.parentElement.parentElement;
        console.log("parent", parent);
        document.getElementById("actualiza_salon").value = parent.children[0].innerText;
        document.getElementById("actualiza_salon").classList.add("readOnly_input");
        document.getElementById("actualiza_salon").readOnly = true;
        document.getElementById("actualiza_edificio").value = parent.children[1].innerText;
        document.getElementById("actualiza_nombre").value = parent.children[2].innerText;
        document.getElementById("actualiza_aforo100").value = parent.children[3].innerText;
        document.getElementById("actualiza_aforo75").value = parent.children[4].innerText;
        document.getElementById("actualiza_aforo50").value = parent.children[5].innerText;
 
    }else{
        document.getElementById("table_container").classList.remove("no_visible");
        document.getElementById("busqueda").classList.remove("no_visible");
        document.getElementById("tipo_filtro").classList.remove("no_visible");
        document.getElementById("actualiza_form").classList.add("no_visible");
        document.getElementById("agrega_salon").classList.remove("no_visible");
    }
}



function limpiar_tabla(){
    let tbody = document.getElementById("tabla_body")
    while(tbody.firstChild){
        tbody.removeChild(tbody.firstChild);
    }
    prepara_lista_salones();
}




// ======================== validaciones ===============================

function validaForm(edificio, nombre, aforo100, aforo75, aforo50){
    
    if(  isNaN(aforo100) || isNaN(aforo75) || isNaN(aforo50) || aforo100 === "" || aforo75 === "" || aforo50 === ""){
        alert("Todos los aforos deben de tener un valor numérico mayor a cero");
        return false;
    } 
    if(edificio === "" || nombre === ""){
        alert("Edificio y nombre no pueden tener un valor vacío");
        return false;
    }
    
    return true; 
}


// =================== para el filtro de busqueda ====================

function filtra() {
    let input = document.getElementById("busqueda");
    let filtro = input.value.toUpperCase(); 
    let tabla = document.getElementById("tabla_body"); 
    let tr = tabla.getElementsByTagName("tr");
     
    let txtValue;
    let tipo = document.getElementById("tipo_filtro").selectedIndex;
    

    for (let i = 0; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName("td")[tipo];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filtro) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }       
    }
  }