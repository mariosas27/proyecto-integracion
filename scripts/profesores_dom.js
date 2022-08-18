// ======================== controladores ==============================

window.addEventListener('load', prepara_lista_profesores);

async function prepara_lista_profesores(){
    let profesores =  await lista_profesores(); 
    muestra_profesores(profesores);
    return profesores;
}



async function controlador_elimina_profesor(e){
    e.preventDefault();
    let opcion = confirm(`¿Está seguro de eliminar al profesor ${e.target.id}?`);
    if(opcion){
        await elimina_profesor(e.target.id);
        limpiar_tabla();
        
    }
}   


async function controlador_crea_profesor(e){
    e.preventDefault();
    
    let num_eco = document.getElementById("num_eco").value;
    let nombre = document.getElementById("nombre").value;
    let apellidos = document.getElementById("apellidos").value;
    let email = document.getElementById("email").value;
    let notas = document.getElementById("notas").value;
    let dpto = document.getElementById("dpto").options[document.getElementById("dpto").selectedIndex].value;

    if(!validaForm(num_eco, nombre, apellidos, email, notas)){
        return;
    }
    let res = await crea_profesor(num_eco, apellidos, nombre, email, dpto, notas);
    
    if(!isNaN(res)){
        limpiar_tabla();
        document.getElementById("register_form").reset();
        alert("Se ha agregado al profesor");
    }else{
        alert("Profesor no agregado, revisa que todos los datos sean correctos y que no esté duplicado");
    }
    
}



async function controlador_actualiza_profesor(e){
    e.preventDefault();
    
    let num_eco = document.getElementById("actualiza_num_eco").value;
    let nombre = document.getElementById("actualiza_nombre").value;
    let apellidos = document.getElementById("actualiza_apellidos").value;
    let email = document.getElementById("actualiza_email").value;
    let notas = document.getElementById("actualiza_notas").value;
    let dpto = document.getElementById("actualiza_dpto").options[document.getElementById("actualiza_dpto").selectedIndex].value;

    if(!validaForm(null,nombre, apellidos, email, notas)){
        return;
    }
    let res = await actualiza_profesor(num_eco, apellidos, nombre, email, dpto, notas);
    console.log("resultado: ", res);
    
    if(res === null){
        limpiar_tabla();
        document.getElementById("register_form").reset();
        alert("Se ha actualizó el profesor");
        document.getElementById("table_container").classList.remove("no_visible");
        document.getElementById("actualiza_form").classList.add("no_visible");
    }else{
        alert("Profesor no actualizado, revisa que todos los datos sean correctos");
    }

}


// ======================= mostrar contenido ===========================



function muestra_profesores(profesores){
    for(let profesor of profesores){
        let tr = document.createElement('tr');
        for(let campo of ["profesor", "nombre", "apellidos", "email", "departamento", "notas"]){
            let td = document.createElement('td');
            td.innerText = profesor[campo];
            tr.appendChild(td);
        }
        //Icono de eliminar y actualizar

        let tdActualiza = document.createElement('td');
        let btnActualiza = document.createElement('button');
        btnActualiza.setAttribute("id", profesor.profesor);
        btnActualiza.setAttribute("onclick", "muestra_actualiza_form(event)");
        btnActualiza.classList.add("bx", "bx-edit-alt","edit_icon");
        tdActualiza.appendChild(btnActualiza);

        tr.appendChild(tdActualiza);

        let tdElimina = document.createElement('td');
        let btnElimina = document.createElement('button');
        btnElimina.setAttribute("id", profesor.profesor);
        btnElimina.setAttribute("onclick", "controlador_elimina_profesor(event)");
        btnElimina.classList.add("bx", "bx-x-circle","delete_icon");
        tdElimina.appendChild(btnElimina);

        tr.appendChild(tdElimina);

        document.getElementById("tabla_body").appendChild(tr);
    }
}


function muestra_crea_form(e){
    e.preventDefault();
    if(e.target.id === "agrega_profesor"){
        document.getElementById("register_form").classList.remove("no_visible");
        
        document.getElementById("cancelar_agrega_profesor").classList.remove("no_visible");

        document.getElementById("agrega_profesor").classList.add("no_visible");

        document.getElementById("busqueda").classList.add("no_visible");
        document.getElementById("tipo_filtro").classList.add("no_visible");

    }else{
        document.getElementById("register_form").reset();

        document.getElementById("register_form").classList.add("no_visible");
        
        document.getElementById("cancelar_agrega_profesor").classList.add("no_visible");

        document.getElementById("agrega_profesor").classList.remove("no_visible");

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
        document.getElementById("agrega_profesor").classList.add("no_visible");


        let parent = e.target.parentElement.parentElement;
    
        document.getElementById("actualiza_num_eco").value = parent.children[0].innerText;
        document.getElementById("actualiza_num_eco").classList.add("readOnly_input");
        document.getElementById("actualiza_num_eco").readOnly = true;
        document.getElementById("actualiza_nombre").value = parent.children[1].innerText;
        document.getElementById("actualiza_apellidos").value = parent.children[2].innerText;
        document.getElementById("actualiza_email").value = parent.children[3].innerText;
        document.getElementById("actualiza_notas").value = parent.children[5].innerText;
 
        let dptoOptions = ["", "CB", "EL", "EN", "MA", "SI"];
        for(let i = 0; i < dptoOptions.length; ++i){
            if(dptoOptions[i] === parent.children[4].innerText){
                document.getElementById("actualiza_dpto").selectedIndex = i;
                break; 
            }
        }
    }else{
        document.getElementById("busqueda").classList.remove("no_visible");
        document.getElementById("tipo_filtro").classList.remove("no_visible");
        document.getElementById("agrega_profesor").classList.remove("no_visible");
        document.getElementById("table_container").classList.remove("no_visible");
        document.getElementById("actualiza_form").classList.add("no_visible");
    }
}



function limpiar_tabla(){
    let tbody = document.getElementById("tabla_body")
    while(tbody.firstChild){
        tbody.removeChild(tbody.firstChild);
    }
    prepara_lista_profesores();
}




// ======================== validaciones ===============================


function validaForm(num_eco, nombre, apellidos, email, notas){

    // si se va a crea un profesor...
    if(num_eco !== null){ 
        if(isNaN(num_eco)){
            alert("Número económico debe de ser un número");
            console.log("aquí estoy");
            return false;
        }
        if(num_eco == ""){
            alert("Número económico no puede tener un valor vacío");
            return false;    
        }
    }
    
    if(apellidos === "" || nombre === "" || email === "" || notas === ""){
        alert("Nombre, apellidos, email y notas no pueden tener un valor vacío");
        return false;
    }
    
    if(email !== ""){
        if(!validarEmail(email)){
            alert("Inserta un email válido");
            return false;
        }
    }

    return true; 
}


function validarEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
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