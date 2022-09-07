let evaluaciones;
let evaluacion_actual;
let valor_previo_profesores = 0;
let valor_previo_horarios = 0;
// =================== rutinas auxiliares de dibujo ====================
function redibuja_grupo(tr) {
    for(let td of tr.childNodes) {
       if (td.className != "") {
          td.innerText = tr.grupo[td.className];
       }
    }
}

function dibuja_grupo(grupo) {
    let tr = document.createElement("tr");
    tr.id = grupo.grupo, tr.grupo = grupo;
    for(let campo of [ "clave", "uea", "nombre", "horas"]){
        let td = document.createElement("td");
        td.className = campo;
        tr.appendChild(td);
    }

    redibuja_grupo(tr);   

    let tdProfesores = document.createElement("td");
    let spanProfesores = document.createElement("span");
    let profesores = "No hay profesores asignados!";
    spanProfesores.classList.add("alert_notif");
    if(grupo.profesores !== undefined){
        spanProfesores.classList.remove("alert_notif");
        profesores = "";
        for(let profesor of grupo.profesores){
            profesores += profesor.nombre + " " + profesor.apellidos + "\n";
        }
    }
    spanProfesores.innerText = profesores;
    tdProfesores.appendChild(spanProfesores);
    tr.appendChild(tdProfesores);

    let btnVerHorarios = document.createElement("button"), tdVerHorario = document.createElement("td"); 
    btnVerHorarios.innerText = "Ver Horarios";
    btnVerHorarios.classList.add("btn_small", "btn_blue");
    btnVerHorarios.onclick = () => muestra_horario(tr.grupo);
    let spanHorarios = document.createElement("span");
    spanHorarios.classList.add("alert_notif");
    spanHorarios.innerText = "No hay horarios!"
    if(grupo.horarios !== undefined){
        tdVerHorario.appendChild(btnVerHorarios);
    }else{
        tdVerHorario.appendChild(spanHorarios);
    }
    tr.appendChild(tdVerHorario);

    let btnActualiza = document.createElement("button"), tdActualiza = document.createElement("td");
    btnActualiza.classList.add("bx", "bx-edit-alt","edit_icon");
    tdActualiza.appendChild(btnActualiza);
    tr.appendChild(tdActualiza);

    let btnElimina = document.createElement("button"), tdElimina = document.createElement("td");
    btnElimina.onclick = ( ) => muestra_eliminacion_grupo(tr.grupo);
    btnElimina.classList.add("bx", "bx-x-circle","delete_icon");
    tdElimina.appendChild(btnElimina);
    tr.appendChild(tdElimina);

   document.getElementById("tabla_grupos_cuerpo").appendChild(tr);
}

function dibuja_horarios(horarios){
    limpiar_tabla("tabla_horarios_cuerpo");
    for(let horario of horarios){
        let trHorario = document.createElement("tr");
        let tdDia = document.createElement("td");
        tdDia.innerText = match_day(horario.dia);
        trHorario.appendChild(tdDia);

        let tdSalon = document.createElement("td");
        tdSalon.innerText = horario.nombre;
        trHorario.appendChild(tdSalon);

        let tdInicio = document.createElement("td");
        tdInicio.innerText = horario.inicio;
        trHorario.appendChild(tdInicio);

        let tdTermino = document.createElement("td");
        tdTermino.innerText = horario.termino;
        trHorario.appendChild(tdTermino);

        document.getElementById("tabla_horarios_cuerpo").appendChild(trHorario);
    }
}

function oculta_grupos(){
    document.getElementById("contenedor_busqueda").classList.add("no_visible");
    document.getElementById("contenedor_tabla").classList.add("no_visible");
}

function muestra_grupos_tabla(){
    document.getElementById("contenedor_busqueda").classList.remove("no_visible");
    document.getElementById("contenedor_tabla").classList.remove("no_visible");
}

function dibuja_uea(uea){
    let option = document.createElement("option");
    option.innerText = uea.nombre, option.value = uea.uea;
    document.getElementById('select_ueas').appendChild(option);
}

function dibuja_select(id, elemento, tipo){
    let option = document.createElement("option");
    if(tipo === 'profesor'){
        option.innerText = elemento.nombre + " " + elemento.apellidos;
    }else if(tipo === 'salon' || tipo === 'uea'){
        option.innerText = elemento.nombre;
    }
    option.value = elemento[tipo];
    document.getElementById(id).appendChild(option);
}

async function numero_entradas_profesor(){
    // document.getElementById('forma_creacion').reset();
    let actual = document.getElementById('num_entradas_profesor').value;
    if(actual - valor_previo_profesores > 0){
        let divProfesor = document.createElement('div');
        divProfesor.classList.add('entrada_form_aux');
        let label = document.createElement('label');
        label.innerText = "Selecciona un profesor";
        divProfesor.appendChild(label);
        let select = document.createElement('select');
        select.name = `profesor_select_${actual}`;
        let profesores = await lista_profesores();
        for(let profesor of profesores){
            let option = document.createElement('option');
            option.innerText = profesor.nombre + " " + profesor.apellidos;
            option.value = profesor.profesor;
            select.appendChild(option);
        }
        divProfesor.appendChild(select);
        document.getElementById('contenedor_profesores').appendChild(divProfesor);
    }else{
        if(document.getElementById('contenedor_profesores').lastChild){
            document.getElementById('contenedor_profesores').removeChild(document.getElementById('contenedor_profesores').lastChild);
        }
    }
    valor_previo_profesores = actual;
}

async function numero_entradas_horarios(){
    let actual = document.getElementById('num_entradas_horarios').value;
    if(actual - valor_previo_horarios > 0){
        let divHorario = document.createElement('div');
        divHorario.classList.add('entrada_form_aux');
        //salones
        let label = document.createElement('label');
        label.innerText = "Selecciona un salón";
        divHorario.appendChild(label);
        let select = document.createElement('select');
        select.name = `horarios_${actual}_salon`;
        let salones = await lista_salones();
        for(let salon of salones){
            let option = document.createElement('option');
            option.innerText = salon.nombre;
            option.value = salon.salon;
            select.appendChild(option);
        }
        divHorario.appendChild(select);
        
        //dias de la semana
        let divCheckBox = document.createElement('div');
        divCheckBox.classList.add('contenedor_checkbox');
        let dias = [{'dia': 'Lunes', 'clave': 'LU' },
                    {'dia': 'Martes', 'clave': 'MA' },
                    {'dia': 'Miércoles', 'clave': 'MI' },
                    {'dia': 'Jueves', 'clave': 'JU' },
                    {'dia': 'Viernes', 'clave': 'VI' }];
        for(let dia of dias){
            let label = document.createElement('label');
            label.innerText = dia.dia;
            let input = document.createElement('input');
            input.type = 'checkbox';
            input.name = `horarios_${actual}_${dia.dia}`;
            input.value = dia.clave;
            divCheckBox.appendChild(label);
            divCheckBox.appendChild(input);
        }
        divHorario.appendChild(divCheckBox);
        //time
        let divTime = document.createElement('div');
        divTime.classList.add('time_contenedor');
        let timeInicio = document.createElement('input');
        timeInicio.type = "time"; 
        timeInicio.name = `horarios_${actual}_inicio`;
        let labelTime = document.createElement('label');
        labelTime.innerText = "Horario: ";
        divTime.appendChild(labelTime);
        divTime.appendChild(timeInicio);

        let timeTermino = document.createElement('input');
        timeTermino.type = "time"; 
        timeTermino.name = `horarios_${actual}_termino`;
        let labelTimeTermino = document.createElement('label');
        labelTimeTermino.innerText = "-";
        divTime.appendChild(labelTimeTermino);
        divTime.appendChild(timeTermino);

        divHorario.appendChild(divTime);
        document.getElementById('contenedor_horarios').appendChild(divHorario);

    }else{
        if(document.getElementById('contenedor_horarios').lastChild){
            document.getElementById('contenedor_horarios').removeChild(document.getElementById('contenedor_horarios').lastChild);
        }
    }
    valor_previo_horarios = actual;
}
// =================== consultar, agregar, actualizar y eliminar ====================

async function muestra_trimestres(){
    evaluaciones = await lista_evaluaciones();
    let trimestres = [];
    for(let evaluacion of evaluaciones.reverse()){
        if(!trimestres.includes(`${evaluacion.trimestre}_${evaluacion.periodo}`)){
            let option = document.createElement('option');
            option.value = option.innerText  = `${evaluacion.trimestre}_${evaluacion.periodo}`;
            document.getElementById('trimestre_filtro').appendChild(option);
            trimestres.push(`${evaluacion.trimestre}_${evaluacion.periodo}`);
        }   
    }
    evaluacion_actual = evaluaciones[1].evaluacion;
    muestra_grupos(evaluaciones[1].evaluacion);
}

async function muestra_grupos(evaluacion){
    for(let grupo of Object.entries(await lista_grupos(evaluacion))){
        let tmp = {
            "grupo": grupo[0],
            "clave": grupo[1]["clave"], 
            "uea": grupo[1]["uea"],
            "nombre": grupo[1]["nombre"],
            "horas": grupo[1]["horas"],
            "profesores": grupo[1]["profesores"],
            "horarios": grupo[1]["horarios"]
        }
        dibuja_grupo(tmp);
    }
}

function muestra_horario(grupo){
    oculta_grupos();
    //información del grupo
    document.getElementById("p_grupo").innerText = grupo.clave;
    document.getElementById("p_uea").innerText = grupo.uea;
    document.getElementById("p_nombre").innerText = grupo.nombre;
    document.getElementById("p_horas").innerText = grupo.horas;

    document.getElementById("vista_horario").classList.remove("no_visible");
    dibuja_horarios(grupo.horarios)
}

function cierra_vista_horarios(){
    document.getElementById("vista_horario").classList.add("no_visible");
    muestra_grupos_tabla();
}

function muestra_eliminacion_grupo(grupo) {
    if (confirm(`¿Está seguro de eliminar grupo ${grupo.nombre}`)) {
       ejecuta_eliminacion_grupo(grupo);
    }
}
 
async function ejecuta_eliminacion_grupo(grupo) {
    await elimina_grupo(grupo.grupo);
    alert("Se eliminó el grupo exitosamente.");
    document.getElementById(grupo.grupo).remove( );
}

function carga_informacion(){
    carga_ueas();
}

async function carga_ueas(){
    let ueas = await lista_ueas();
    for(let uea of ueas){
        dibuja_select('select_ueas', uea, 'uea');
    }
}

function ejecuta_creacion_grupo(forma){
    let datos = Object.fromEntries((new FormData(forma)).entries());
    console.log(datos);
    forma.reset();

    console.log('Profesores agrupados ---> ', agrupa_profesores(datos))
    console.log('Horarios agrupados ---> ', agrupa_horarios(datos))
}

function agrupa_profesores(datos){
    let profesores = Object.keys(datos).filter( elm => elm.includes('profesor_select_') );
    profesores = profesores.map( elm => datos[elm] );
    return profesores;
}

function agrupa_horarios(datos){
    let horarios = []
    for(let i = 1; i <= valor_previo_horarios; ++i){
        let tmp = Object.keys(datos).filter( elm => elm.includes(`horarios_${i}`));
        // tmp = tmp.map( elm => {elm: datos[elm]} );
        horarios.push(tmp);
    }
    return horarios;
}
// =================== buscar ====================

async function filtra_trimestre(){
    let trimestre = document.getElementById('trimestre_filtro').value;
    let tipo = document.getElementById('evaluacion_filtro').value;
    for(let evaluacion of evaluaciones){
        if(trimestre === `${evaluacion.trimestre}_${evaluacion.periodo}` && tipo === evaluacion.tipo){
            limpiar_tabla("tabla_grupos_cuerpo"); //quiero creer que en este caso como ya nomanejamos toda una evaluación, en este caso sí se elimina toda la tabla porque cambiamos de evaluación, la cual tiene todos los grupos diferentes a la evaluación previa
            muestra_grupos(evaluacion.evaluacion);
            break;
        }       
    }
}

//funciones auxiliares
function limpiar_tabla(id_tabla){
    let tbody = document.getElementById(id_tabla);
    while(tbody.firstChild){
        tbody.removeChild(tbody.firstChild);
    }
}

function match_day(dia){
    let dias = {
        "LU": "Lunes",
        "MA": "Martes",
        "MI": "Miércoles",
        "JU": "Jueves",
        "VI": "Viernes"
    };
    let tmp = "";
    for(let token of dia.split(/[, ]+/)){
        tmp += dias[token] + " ";
    }
    return tmp;
}
