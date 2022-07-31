let usuario = null;

async function inicia_sesion(intento = null, redirigir_index = false) {
   try {
      let res = await ajax_post("scripts/sesion.php", (intento == null ? { "servicio": "estado" } : { "servicio": "entrar", "token": intento.credential }), 3000);
      if (res.estado && res.valor.length != 0) {
         usuario = res.valor;
         document.body.classList.add("autenticado");
         document.getElementById("usuario").innerText = res.valor.nombre;
      } else {
         if (!res.estado) {
            window.alert((res.valor == "token_invalido" ? "El servidor rechazó la verificación de identidad." :
                         (res.valor == "email_invalido" ? "Tu cuenta de correo no está autorizada para usar la aplicación. Verifica que estés usando una cuenta autorizada o reporta el problema." :
                                                          "Error en la invocación del servicio. Favor de reportar el problema.")));
         }
         if (redirigir_index) {
            window.location.href = "index.html";
         }
      }
   } catch (e) {
      console.log(ex);
   }
}

async function termina_sesion( ) {
   try {
      await ajax_post("scripts/sesion.php", { "servicio": "salir" }, 3000);
      window.location.href = "index.html";
   } catch (e) {
      console.log(ex);
   }
}
