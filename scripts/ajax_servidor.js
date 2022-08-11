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