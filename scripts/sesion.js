async function inicia_sesion(usuario = null) {
   try {
      let res = await ajax_post("scripts/sesion.php", (usuario == null ? { "servicio": "estado" } : { "servicio": "entrar", "token": usuario.credential }), 3000);
      if (!res.estado) {
         if (res.valor == "token_invalido") {
            window.alert("El servidor rechazó la verificación de identidad.");
         } else {
            window.alert("Error en la invocación del servicio. Favor de reportar el problema.");
         }
      } else {
         if (res.valor.email != undefined && res.valor.nombre != undefined) {
            alert(`Entrando como:\n${res.valor.email} ${res.valor.nombre}`);
            document.body.classList.add("autenticado");
         }
      }
   } catch (e) {
      console.log(ex);
   }
}
