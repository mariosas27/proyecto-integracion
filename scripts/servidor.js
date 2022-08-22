async function peticion(funcion, url, ...parametros) {
   try {
      var res = await(funcion(url, ...parametros));
   } catch (ex) {
      (( ) => {
         if (ex.message == "timeout" || ex.message == "abort" || ex.message == "res.valor") {
            return window.alert("Error al intentar establecer comunicación con el servidor. Inténtalo de nuevo más tarde.");
         } else {
            return window.alert("Error interno de la aplicación. Favor de reportar el problema.");
         }
      })( );
      throw ex;
   }
   
   if (!res.estado) {
      (( ) => {
         let script = url.split(/\.|\//).reverse( )[1];
         if (script == "profesores") {
            if (res.valor == "inexistente") {
               return window.alert("El profesor referido no existe. Favor de verificar.");
            } else if (res.valor == "duplicado") {
               return window.alert("Ya existe un profesor con el mismo número económico. Favor de verificar.");
            }
         } else if (script == "salones") {
            if (res.valor == "inexistente") {
               return window.alert("El salón referido no existe. Favor de verificar.");
            } else if (res.valor == "duplicado") {
               return window.alert("Ya existe un salon con el mismo nombre. Favor de verificar.");
            }
         } else if (script == "sesion") {
            if (res.valor == "token_invalido") {
               return window.alert("El servidor rechazó la verificación de identidad.");
            } else if (res.valor == "email_invalido") {
               return window.alert("Tu cuenta de correo no está autorizada para usar la aplicación. Verifica que estés usando una cuenta autorizada o reporta el problema.");
            }
         }
         return window.alert("Error interno de la aplicación. Favor de reportar el problema.");
      })( );
      throw res.valor;
   }
   return res.valor;
}

// profesores

async function lista_profesores(){
    return await peticion(ajax_post, "scripts/profesores.php", { "servicio": "listar_profesores" }, 1000);
}

async function crea_profesor(profesor, apellidos, nombre, email, departamento, notas){
    return await peticion(ajax_post, "scripts/profesores.php", {
       "servicio": "crear_profesor", 
       "profesor": profesor,
       "apellidos": apellidos,
       "nombre": nombre,
       "email": email, 
       "departamento": departamento, 
       "notas": notas
    }, 1000);
}

async function actualiza_profesor(profesor, apellidos, nombre, email, departamento, notas) {
    return await peticion(ajax_post, "scripts/profesores.php", { 
       "servicio": "actualizar_profesor", 
       "profesor": profesor, 
       "apellidos": apellidos, 
       "nombre": nombre, 
       "email": email, 
       "departamento": departamento, 
       "notas": notas
    }, 1000);
}

async function elimina_profesor(profesor){
    return await peticion(ajax_post, "scripts/profesores.php", {
       "servicio": "eliminar_profesor",
       "profesor": profesor
    }, 1000);
}

// salones

async function lista_salones(){
    return await peticion(ajax_post, "scripts/salones.php", { "servicio": "listar_salones" }, 1000);
}

async function actualiza_salon(salon, edificio, nombre, aforo100, aforo75, aforo50){
   return await peticion(ajax_post, "scripts/salones.php", {
      "servicio": "actualizar_salon",
      "salon": salon, 
      "edificio": edificio,
      "nombre": nombre,
      "aforo100": aforo100, 
      "aforo75": aforo75, 
      "aforo50": aforo50
   }, 1000);
}

async function crea_salon(edificio, nombre, aforo100, aforo75, aforo50){
    return await peticion(ajax_post, "scripts/salones.php", {
       "servicio": "crear_salon",
       "edificio": edificio,
       "nombre": nombre,
       "aforo100": aforo100, 
       "aforo75": aforo75, 
       "aforo50": aforo50
    }, 1000);
}

async function elimina_salon(salon){
    return await peticion(ajax_post, "scripts/salones.php", {
       "servicio": "eliminar_salon",
       "salon": salon
    }, 1000);
}

// ueas

async function lista_ueas(){
    return await peticion(ajax_post, "scripts/ueas.php", { "servicio": "listar_ueas" }, 1000);
}
