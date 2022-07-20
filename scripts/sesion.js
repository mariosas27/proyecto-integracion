async function inicia_sesion_impl(usuario = null) {
   return examina_respuesta(await ajax_post("scripts/sesion.php", (usuario == null ? { "servicio": "estado" } : { "servicio": "entrar", "token": usuario.credential }), 3000), function(res) {
      if (!res.estado) {
         if (res.valor == "token_invalido") {
            window.alert("El servidor rechazó la verificación de identidad.");
         } else if (res.valor == "email_invalido") {
            window.alert("Tu cuenta de correo no está autorizada para usar la aplicación por esta vía.\nSi eres alumno de la UAM Azcapotzalco, usa tu correo institucional.\nSi eres administrador, verifica que estés usando la cuenta autorizada o reporta el problema.");
            termina_sesion( );
         } else {
            window.alert("Error en la invocación del servicio. Favor de reportar el problema.");
         }
      } else {
         if (res.valor.tipo != null) {
            document.body.classList.add("autenticado");
            document.body.classList.add(res.valor.tipo);
            document.getElementById("nombre").innerText = res.valor.nombre;
         }
      }
      return res;
   });
};

async function inicia_sesion(usuario = null) {
   let res = await inicia_sesion_impl(usuario);
   if (res != null && res.valor.tipo != null) {
      if (continuacion != null) {
         continuacion(res.valor);
      }
   }
}

async function inicia_sesion_optativa( ) {
   let res = await inicia_sesion_impl( );
   if (res != null) {
      if (continuacion != null) {
         continuacion(res.valor);
      }
   }
}

async function inicia_sesion_obligatoria(tipo = null) {
   let res = await inicia_sesion_impl( );
   if (res != null && res.valor.tipo != null && (tipo == null || res.valor.tipo == tipo)) {
      if (continuacion != null) {
         continuacion(res.valor);
      }
   } else {
      window.location.href = "index.html";
   }
};

async function termina_sesion( ) {
   ajax_post("scripts/sesion.php", { "servicio": "salir" }, 3000);
   window.location.href = "index.html";
}
