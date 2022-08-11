async function lista_ueas(){
    let res = await peticion(ajax_post, 
                            "scripts/ueas.php", 
                            { "servicio": "listar_ueas"},
                            1000);
    console.log(res);
}

