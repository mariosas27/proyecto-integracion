function array2csv(filas) {
   return filas.map((fila) => fila.map(String).map((celda) => celda.replaceAll('"', '""')).map((celda) => `"${celda}"`).join(",")).join("\r\n");
}

function download_blob(contenido, nombre, tipo) {
   let a = document.createElement("a");
   a.href = URL.createObjectURL(new Blob([ contenido ], { "type": tipo }));
   a.setAttribute("download", nombre);
   a.click( );
}
