let usuario = null;

async function inicia_sesion(intento = null, redirigir_index = false) {
   let datos = await peticion(ajax_post, "scripts/sesion.php", (intento == null ? { "servicio": "estado" } : { "servicio": "entrar", "token": intento.credential }), 3000);
   if (Array.isArray(datos) && datos.length != 0) {
      usuario = res.valor;
      document.body.classList.add("autenticado");
      document.getElementById("usuario").innerText = res.valor.nombre;
   } else if (datos !== false && redirigir_index) {
      window.location.href = "index.html";
   }
}

async function termina_sesion( ) {
   let datos = await peticion(ajax_post, "scripts/sesion.php", { "servicio": "salir" }, 3000);
   if (datos !== false) {
      window.location.href = "index.html";
   }
}
