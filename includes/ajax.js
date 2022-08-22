function ajax_formdata(parametros) {
   if (parametros instanceof HTMLFormElement) {
      return new FormData(parametros);
   } else {
      let res = new FormData( );
      for (let nombre in parametros) {
         res.append(nombre, (typeof(parametros[nombre]) == 'object' ? JSON.stringify(parametros[nombre]) : parametros[nombre]));
      }
      return res;
   }
}

function ajax_get(url, timeout, parse = true, cb_progreso = null) {
   let ajax = new XMLHttpRequest( );
   ajax.open("GET", url);
   return ajax_send(ajax, null, timeout, parse, cb_progreso);
}

function ajax_post(url, parametros, timeout, parse = true, cb_progreso = null) {
   let ajax = new XMLHttpRequest( );
   ajax.open("POST", url);
   return ajax_send(ajax, ajax_formdata(parametros), timeout, parse, cb_progreso);
}

function ajax_send(ajax, parametros, timeout, parse = true, cb_progreso = null) {
   return new Promise(function(resolver) {
      ajax.timeout = timeout;
      ajax.onload = ( ) => {
         if (ajax.status == 200) {
            if (parse) {
               try {
                  resolver(JSON.parse(ajax.responseText));
               } catch (e) {
                  resolver(new Error("parse"));
               }
            } else {
               resolver(ajax.responseText);
            }
         } else {
            resolver(new Error("load"));
         }
      };
      ajax.onabort = ( ) => {
         resolver(new Error("abort"));
      };
      ajax.onerror = ( ) => {
         resolver(new Error("error"));
      };
      ajax.ontimeout = ( ) => {
         resolver(new Error("timeout"));
      };
      if (cb_progreso != null) {
         ajax.onprogress = (evento) => {
            cb_progreso(evento.loaded, evento.total);
         }
      }
      ajax.send(parametros);
   });
}