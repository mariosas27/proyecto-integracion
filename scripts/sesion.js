let usuario = null;

async function inicia_sesion(intento = null, redirigir_index = false) {
   let res = await peticion(ajax_post, "scripts/sesion.php", (intento == null ? { "servicio": "estado" } : { "servicio": "entrar", "token": intento.credential }), 3000);
   if (res.length != 0) {
      usuario = res;
      document.body.classList.add("autenticado");
      document.getElementById("usuario").innerText = res.nombre;
   } else if (redirigir_index) {
      window.location.href = "index.html";
   }
}

async function termina_sesion( ) {
   await peticion(ajax_post, "scripts/sesion.php", { "servicio": "salir" }, 3000);
   window.location.href = "index.html";
}
