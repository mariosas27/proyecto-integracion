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

function dibuja_grupo(grupo, posicion = "final") {
    let tr = document.createElement("tr");
    tr.id = grupo.grupo, tr.grupo = grupo;
    for(let campo of [ "clave", "uea", "nombre", "horas", "cupo"]){
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
    btnActualiza.onclick = ( ) => muestra_actualizacion_grupo(tr.grupo);
    btnActualiza.classList.add("bx", "bx-edit-alt","edit_icon");
    tdActualiza.appendChild(btnActualiza);
    tr.appendChild(tdActualiza);

    let btnElimina = document.createElement("button"), tdElimina = document.createElement("td");
    btnElimina.onclick = ( ) => muestra_eliminacion_grupo(tr.grupo);
    btnElimina.classList.add("bx", "bx-x-circle","delete_icon");
    tdElimina.appendChild(btnElimina);
    tr.appendChild(tdElimina);
    if(posicion === "final"){
        document.getElementById("tabla_grupos_cuerpo").appendChild(tr);
    }else{
        document.getElementById("tabla_grupos_cuerpo").prepend(tr);
    }
    
}

function dibuja_horarios(horarios){
    limpiar_elemento_hijos("tabla_horarios_cuerpo");
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

function oculta_grupos_tabla(){
    document.getElementById("contenedor_busqueda").classList.add("no_visible");
    document.getElementById("contenedor_tabla").classList.add("no_visible");
}

function muestra_grupos_tabla(){
    document.getElementById("contenedor_busqueda").classList.remove("no_visible");
    document.getElementById("contenedor_tabla").classList.remove("no_visible");
}

function oculta_forma(forma){
    muestra_grupos_tabla();
    forma.classList.add('no_visible');
    limpiar_elemento_hijos("contenedor_profesores");
    limpiar_elemento_hijos("contenedor_horarios");
    limpiar_elemento_hijos("contenedor_profesores_actualizar");
    limpiar_elemento_hijos("contenedor_horarios_actualizar");
}

function dibuja_forma(forma, grupo = null){
    oculta_grupos_tabla();
    valor_previo_horarios = 0;
    valor_previo_profesores = 0;
    forma.reset();
    forma.classList.remove("no_visible");
    let campos = ['grupo','uea', 'clave', 'cupo'];
    //para la actualizacion
    if(grupo !== null){
        for(let campo of campos){
            forma[campo].value = grupo[campo];
        }
        if(grupo['cupo'] === ""){
            forma['cupo'].value = 0;
        }
        valor_previo_profesores = forma['num_entradas_profesor_actualizar'].value = (grupo.profesores !== undefined) ? grupo.profesores.length : 0;
        valor_previo_horarios = forma['num_entradas_horarios_actualizar'].value = (grupo.horarios !== undefined) ? grupo.horarios.length : 0;

        for(let i = 1; i <= valor_previo_profesores; ++i){
            dibuja_contenedor_nuevo_profesor(i, 'contenedor_profesores_actualizar', grupo.profesores[i - 1].profesor);
        }

        for(let i = 1; i <= valor_previo_horarios; ++i){
            dibuja_contenedor_nuevo_horario(i, 'contenedor_horarios_actualizar', grupo.horarios[i - 1]);
        }
    }
}

function dibuja_uea(uea){
    let option = document.createElement("option");
    option.innerText = uea.nombre, option.value = uea.uea;
    document.getElementById('select_ueas').appendChild(option);
}

async function numero_entradas_profesor(contenedorPadre, inputOrigen){
    let actual = document.getElementById(inputOrigen).value;
    if(actual - valor_previo_profesores > 0){
        await dibuja_contenedor_nuevo_profesor(actual, contenedorPadre);
    }else{
        if(document.getElementById(contenedorPadre).lastChild){
            document.getElementById(contenedorPadre).removeChild(document.getElementById(contenedorPadre).lastChild);
        }
    }
    valor_previo_profesores = actual;
}

async function dibuja_contenedor_nuevo_profesor(numero_select_profesores, contenedorPadre, defaultValor = 0){
    let divProfesor = document.createElement('div');
    divProfesor.classList.add('entrada_form_aux');
    let label = document.createElement('label');
    label.innerText = "Selecciona un profesor";
    divProfesor.appendChild(label);
    let select = document.createElement('select');
    select.name = `profesor_select_${numero_select_profesores}`;
    let defaultOtption = document.createElement('option');
    defaultOtption.innerText = 'Selecciona un profesor';
    defaultOtption.value = 0;
    select.appendChild(defaultOtption);
    let profesores = await lista_profesores();
    for(let profesor of profesores){
        let option = document.createElement('option');
        option.innerText = profesor.nombre + " " + profesor.apellidos;
        option.value = profesor.profesor;
        select.appendChild(option);
    }
    select.value = defaultValor;
    divProfesor.appendChild(select);
    document.getElementById(contenedorPadre).appendChild(divProfesor);
}

function numero_entradas_horarios(contenedorPadre, inputOrigen){
    let actual = document.getElementById(inputOrigen).value;
    if(actual - valor_previo_horarios > 0){
        dibuja_contenedor_nuevo_horario(actual, contenedorPadre);
    }else{
        if(document.getElementById(contenedorPadre).lastChild){
            document.getElementById(contenedorPadre).removeChild(document.getElementById(contenedorPadre).lastChild);
        }
    }
    valor_previo_horarios = actual;
}

async function dibuja_contenedor_nuevo_horario(numero_select_horarios, contenedorPadre, defaultValores = {}){
    let divHorario = document.createElement('div');
    divHorario.classList.add('entrada_form_aux');
    //salones
    let label = document.createElement('label');
    label.innerText = "Selecciona un salón";
    divHorario.appendChild(label);
    let select = document.createElement('select');
    select.name = `horarios_${numero_select_horarios}_salon`;
    // let defaultOtption = document.createElement('option');
    // defaultOtption.innerText = 'Selecciona un salón';
    // defaultOtption.value = null;
    // select.appendChild(defaultOtption);
    let salones = await lista_salones();
    for(let salon of salones){
        let option = document.createElement('option');
        option.innerText = salon.nombre;
        option.value = salon.salon;
        select.appendChild(option);
    }
    select.value = ("salon" in defaultValores) ? defaultValores.salon : 1; 
    divHorario.appendChild(select);
    
    //dias de la semana
    let divCheckBox = document.createElement('div');
    divCheckBox.classList.add('contenedor_checkbox');
    let dias = [{'dia': 'Lunes', 'clave': 'LU' },
                {'dia': 'Martes', 'clave': 'MA' },
                {'dia': 'Miercoles', 'clave': 'MI' },
                {'dia': 'Jueves', 'clave': 'JU' },
                {'dia': 'Viernes', 'clave': 'VI' }];
    let dias_aux = ("dia" in defaultValores) ? defaultValores.dia.split(',') : [];
    for(let dia of dias){
        let label = document.createElement('label');
        label.innerText = dia.dia;
        let input = document.createElement('input');
        input.type = 'checkbox';
        input.name = `horarios_${numero_select_horarios}_${dia.dia}`;
        input.value = dia.clave;
        input.checked = (dias_aux.includes(dia.clave));
        divCheckBox.appendChild(label);
        divCheckBox.appendChild(input);
    }
    divHorario.appendChild(divCheckBox);
    //time
    let divTime = document.createElement('div');
    divTime.classList.add('time_contenedor');
    let timeInicio = document.createElement('input');
    timeInicio.type = "time"; 
    timeInicio.name = `horarios_${numero_select_horarios}_inicio`;
    // timeInicio.pattern = "[0-9]{2}:[0-9]{2}";
    timeInicio.value = ("inicio" in defaultValores) ? defaultValores.inicio.substring(0, 5) : "00:00";
    let labelTime = document.createElement('label');
    labelTime.innerText = "Horario: ";
    divTime.appendChild(labelTime);
    divTime.appendChild(timeInicio);

    let timeTermino = document.createElement('input');
    timeTermino.type = "time"; 
    timeTermino.name = `horarios_${numero_select_horarios}_termino`;
    // timeTermino.pattern = "[0-9]{2}:[0-9]{2}";
    timeTermino.value = ("termino" in defaultValores) ? defaultValores.termino.substring(0,5) : "00:00";
    let labelTimeTermino = document.createElement('label');
    labelTimeTermino.innerText = "-";
    divTime.appendChild(labelTimeTermino);
    divTime.appendChild(timeTermino);

    divHorario.appendChild(divTime);
    document.getElementById(contenedorPadre).appendChild(divHorario);
}


function controlador_keydown(event){
    event.preventDefault();
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
            "cupo": grupo[1]["cupo"], 
            "uea": grupo[1]["uea"],
            "nombre": grupo[1]["nombre"],
            "horas": grupo[1]["horas"],
            "profesores": grupo[1]["profesores"],
            "horarios": grupo[1]["horarios"]
        }
        dibuja_grupo(tmp, "final");
    }
}

async function muestra_actualizacion_grupo(grupo){
    await carga_ueas('select_ueas_act');
    dibuja_forma(document.getElementById('forma_actualizacion'), grupo);
}

function muestra_horario(grupo){
    oculta_grupos_tabla();
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

async function carga_ueas(id){
    let ueas = await lista_ueas();
    for(let uea of ueas){
        let option = document.createElement('option');
        option.innerText = uea.nombre;
        option.value = uea.uea;
        document.getElementById(id).appendChild(option);
    }
}

async function ejecuta_creacion_grupo(forma){
    if(forma.reportValidity()){
        let datos = Object.fromEntries((new FormData(forma)).entries());
        let grupo_creado = await crea_grupo(datos.uea, datos.clave, evaluacion_actual, agrupa_profesores(datos), agrupa_horarios(datos), datos.cupo);
        alert("Se agregó el grupo exitosamente.");
        cancela_creacion_grupo();
        let consulta = await consulta_grupo(grupo_creado);
        dibuja_grupo(consulta, "final");
        document.getElementById(consulta.grupo).classList.add('success_update');
        setTimeout( () => { document.getElementById(consulta.grupo).classList.remove('success_update') }, 4000 );
    }
}

async function ejecuta_actualizacion_grupo(forma){
    let datos = Object.fromEntries((new FormData(forma)).entries());
    await actualiza_grupo(datos.grupo, datos.uea, datos.clave, agrupa_profesores(datos), agrupa_horarios(datos, 'actualizar'), datos.cupo);
    alert("Se actualizó el grupo exitosamente.");
    document.getElementById(datos.grupo).remove();
    dibuja_grupo(await consulta_grupo(datos.grupo), "inicio");
    document.getElementById(datos.grupo).classList.add('success_update');
    setTimeout( () => { document.getElementById(datos.grupo).classList.remove('success_update') }, 4000 );
    cancela_actualizacion_grupo();
}

function agrupa_profesores(datos){
    let profesores = Object.keys(datos).filter( elm => elm.includes('profesor_select_') );
    profesores = profesores.map( elm => parseInt(datos[elm]) );
    return profesores;
}

function agrupa_horarios(datos, tipo = 'crear'){
    let horarios = []
    let inputSizeOrigen = (tipo === 'crear') ? datos.num_entradas_horarios : datos.num_entradas_horarios_actualizar; 
    for(let i = 1; i <= inputSizeOrigen; ++i){
        let tmp = Object.keys(datos).filter( elm => elm.includes(`horarios_${i}`));
        let horarioEntradaTmp = {};
        let keys = ['salon', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'inicio', 'termino'];
        for(let key of keys){
            horarioEntradaTmp[key] = datos[`horarios_${i}_${key}`];
        }
        let dias = obtener_dias_horario(horarioEntradaTmp);
        horarios.push({salon: parseInt(horarioEntradaTmp.salon), dia: dias, inicio: horarioEntradaTmp.inicio, termino: horarioEntradaTmp.termino});
    }
    return horarios;
}

function cancela_creacion_grupo(){
    valor_previo_horarios = 0;
    valor_previo_profesores = 0;
    oculta_forma(document.getElementById("forma_creacion"));
}

function cancela_actualizacion_grupo(){
    valor_previo_horarios = 0;
    valor_previo_profesores = 0;
    oculta_forma(document.getElementById("forma_actualizacion"));
}

function muestra_creacion_grupo(){
    carga_ueas('select_ueas');
    dibuja_forma(document.getElementById("forma_creacion"));
}

// =================== buscar ====================

async function filtra_trimestre(){
    let trimestre = document.getElementById('trimestre_filtro').value;
    let tipo = document.getElementById('evaluacion_filtro').value;
    for(let evaluacion of evaluaciones){
        if(trimestre === `${evaluacion.trimestre}_${evaluacion.periodo}` && tipo === evaluacion.tipo){
            limpiar_elemento_hijos("tabla_grupos_cuerpo"); //quiero creer que en este caso como ya nomanejamos toda una evaluación, en este caso sí se elimina toda la tabla porque cambiamos de evaluación, la cual tiene todos los grupos diferentes a la evaluación previa
            muestra_grupos(evaluacion.evaluacion);
            break;
        }       
    }
}

//funciones auxiliares
function limpiar_elemento_hijos(id){
    while(document.getElementById(id).firstChild){
        document.getElementById(id).removeChild(document.getElementById(id).firstChild);
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
    let aux = [];
    for(let token of dia.split(/[, ]+/)){
        // tmp += dias[token] + " ";
        aux.push(dias[token]);
    }
    return aux.toString();
}

function obtener_dias_horario(horario){
    let dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
    let res = [];
    for(let dia of dias){
        if(horario[dia] !== undefined) res.push(horario[dia])
    }
    return res.toString();
}