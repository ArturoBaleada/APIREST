// Importing the packages required for the project.

const mysql = require("mysql");
const cors = require("cors");
const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const { json } = require("body-parser");
const totales = [];

//Use cors
const whitelist = [
    "http://localhost/UNOCELL",
    "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:3000/INVENTARIO/EXISTE/",
];

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
};
app.use(cors({ origin: corsOptions }));

// Used for sending the Json Data to Node API
app.use(express.json());
app.use(bodyparser.json());

// Connection String to Database
var mysqlConnection = mysql.createConnection({
    host: "unocellhn.com",
    user: "unocellh_uno",
    password: "unocell2021.",
    database: "unocellh_backend",
    multipleStatements: true,
})

// To check whether the connection is succeed for Failed while running the project in console.
mysqlConnection.connect((err) => {
    if (!err) {
        console.log("Db Connection Succeed");
    } else {
        console.log(
            "Db connect Failed \n Error :" + JSON.stringify(err, undefined, 2)
        );
    }
});

// To Run the server with Port Number
app.listen(3000, () =>
    console.log("Express server is running at port no : 3000")
);

//Se unio junto con la rama Seguridad
//{"CONTRA":"Mi","ID":2,"USUARIO":"Laura","RESPUESTA":"3.1416"} para el postman "un ejemplo"
app.put("/PERFIL/PASSWORD", (req, res) => {
    //Encapsulación de valores
    const { CONTRA_OLD, CONTRA_NEW, USUARIO } = req.body;

    //Query para validar las respuestas para un cambio de contraseña ya estando logeado
    let sql =
        "SET @USUARIO=?; SET @CONTRA_OLD=?; SELECT `FT_AUTENTICAR_CONTRASENA`(@USUARIO, @CONTRA_OLD,0) AS `FT_AUTENTICAR_RESPUESTA`;";

    //Envio del query
    mysqlConnection.query(sql, [USUARIO, CONTRA_OLD], (err, rows, fields) => {
        //Obtenemos el valor que nos retorna la función, en este caso es un número
        let Estado = rows[2][0]["FT_AUTENTICAR_RESPUESTA"];
        console.log(Estado);

        //Condición para verificar si no hay error al momento de hacer la petición sql
        if (!err) {
            //Condición para verificar si la respuesta es correcta
            if (Estado == 1) {
                //Creación y envio del query 2 para el cambio de contraseña
                let sql2 =
                    "SET @CONTRA_NEW = ?;SET @USUARIO = ?; CALL `PR_CAMBIO_PASSWORD`(@CONTRA_NEW,@USUARIO);";
                mysqlConnection.query(
                    sql2,
                    [CONTRA_NEW, USUARIO],
                    (err, rows, fields) => {
                        if (!err) {
                            res.send("Updation Done");
                        } else {
                            console.log(err);
                        }
                    }
                );
            } else {
                res.send("No se autentico sus respuestas");
            }
        } else {
            console.log(err);
        }
    });
});


//Ruta para el cambio de contraseña via pregunta y respuesta

app.post("/CAMBIOCONTRA/PREGUNTAS", (req,res) => {
    const { PRE, RES, CONTRA } = req.body;
    //let hola = req.body;
    let queri = "SET @PREGUNTA=?; SET @RESPUESTA=?; SET @NEWCONTRA=?; CALL `PRO_CAMBIO_CONTRA_RECUPERACION`(@PREGUNTA, @RESPUESTA, @NEWCONTRA);";

    //let query = "SET @p0=; SET @p1=; SET @p2=; CALL PRO_CAMBIO_CONTRA_RECUPERACION(@p0, @p1, @p2);";

    mysqlConnection.query(queri,[PRE,RES,CONTRA.toUpperCase()],(err,rows,fields) =>{
        if(!err){
            res.send("CAMBIO DE CONTRA EXITOSO");
        }else{
            console.log(err);
        }
    });
});

 app.post("/CAMBIO/CONTRA",(req,res) => {
    const { PRE , RES , CONTRA } = req.body;
    let consulta = "SET @P=?; SET @R=?; SET @N=?; CALL `PRO_CAMBIO_CONTRA_RECUPERACION`(@P, @R, @N);";
    mysqlConnection.query(consulta,[PRE,RES,CONTRA.toUpperCase()],(err,rows,fields) => {
        if(!err){
            res.send("Hola");
        }else{
            console.log(err);
        }
    });

 });

//Ruta para cambiar la contraseña por primera vez
app.post("/CAMBIO_CONTRA_PRIMERA", (req,res) => {
    const { ACTUAL_PASS, NUEVA_PASS } = req.body;
    //let hola = req.body;
    let queri = "SET @ACTUAL_PASS=?; SET @NUEVA_PASS=?; CALL `PRO_CAMBIO_CONTRA_PRIMERA`(@ACTUAL_PASS, @NUEVA_PASS);";

    //let query = "SET @p0=; SET @p1=; SET @p2=; CALL PRO_CAMBIO_CONTRA_RECUPERACION(@p0, @p1, @p2);";

    mysqlConnection.query(queri,[ACTUAL_PASS.toUpperCase(),NUEVA_PASS.toUpperCase()],(err,rows,fields) =>{
        if(!err){
            res.send("CAMBIO DE CONTRA EXITOSO");
        }else{
            console.log(err);
        }
    });
});

//Esta ruta aún sigue en prueba, no está finalizada
app.post("/login", (req, res) => {
    const { USUARIO, CON_USUARIO } = req.body;
    console.log(USUARIO, CON_USUARIO);
    let objetoDatos = [];
    //query para validar autenticacion
    let sql1 =
        "SET @USUARIO=?; SET @CON_USUARIO=?; SET @INTENTOS=1; SET @ESTADO_AUTENTICACION=0;  SELECT FT_AUTENTICACION(@USUARIO,@CON_USUARIO,@INTENTOS,@ESTADO_AUTENTICACION) AS FT_AUTENTICAR;";
    //Envio del query
    mysqlConnection.query(
        sql1,
        [USUARIO.toUpperCase(), CON_USUARIO],
        (err, rows, fields) => {
            let Estado = rows[4][0]["FT_AUTENTICAR"]; //Variable que almacena el valor retornado del procedimiento almacenado
            objetoDatos.push(Estado);
            console.log(Estado);
            //Condición para verificar si hay o no error en el query
            if (!err) {
                //CONDICIÓN PARA AUTENTICAR USUARIO Y CONTRASEÑA
                if (Estado == 1) {
                    sql2 = "SET @USUARIO=?; CALL PR_ESTADO_ROL_USER(@USUARIO);";
                    mysqlConnection.query(
                        sql2,
                        [USUARIO.toUpperCase()],
                        (err, rows, fields) => {
                            //Variables que almacenan: El rol del user y el IND_Usuario
                            let ROL = rows[1][0].COD_ROL;
                            let Estado_Usuario = rows[1][0].IND_USUARIO;
                            let namePrimero = rows[1][0].NOM_PRIMERO;
                            let nameSegundo = rows[1][0].NOM_SEGUNDO;
                            let apePrimero = rows[1][0].APE_PRIMERO;
                            let apeSegundo = rows[1][0].APE_SEGUNDO;
                            objetoDatos.push(Estado_Usuario);
                            objetoDatos.push(ROL);
                            objetoDatos.push(namePrimero);
                            objetoDatos.push(nameSegundo);
                            objetoDatos.push(apePrimero);
                            objetoDatos.push(apeSegundo);
                            console.log(objetoDatos);
                            res.send(objetoDatos);
                        }
                    );
                } else if (Estado == 2) {
                    sql2 = "SET @USUARIO=?; CALL PR_ESTADO_ROL_USER(@USUARIO);";
                    mysqlConnection.query(
                        sql2,
                        [USUARIO.toUpperCase()],
                        (err, rows, fields) => {
                            //Variables que almacenan: El rol del user y el IND_Usuario y Nombre Completo
                            let ROL = rows[1][0].COD_ROL;
                            let Estado_Usuario = rows[1][0].IND_USUARIO;
                            let namePrimero = rows[1][0].NOM_PRIMERO;
                            let nameSegundo = rows[1][0].NOM_SEGUNDO;
                            let apePrimero = rows[1][0].APE_PRIMERO;
                            let apeSegundo = rows[1][0].APE_SEGUNDO;
                            console.log(rows);
                            objetoDatos.push(Estado_Usuario);
                            objetoDatos.push(ROL);
                            objetoDatos.push(namePrimero);
                            objetoDatos.push(nameSegundo);
                            objetoDatos.push(apePrimero);
                            objetoDatos.push(apeSegundo);
                            console.log(objetoDatos);
                            res.send(objetoDatos);
                        }
                    );
                } else {
                    objetoDatos.push(0);
                    objetoDatos.push(0);
                    //objetoDatos.push(namePrimero);
                    //objetoDatos.push(nameSegundo);
                    //objetoDatos.push(apePrimero);
                    //objetoDatos.push(apeSegundo);
                    console.log(objetoDatos);
                    res.send(objetoDatos);
                }
            } else {
                console.log(err);
            }
        }
    );
});

//Recuperación de contraseña Usuario, ruta para validar si existe el usuario
app.post("/RECUPERACION", (req, res) => {
    const { USUARIO } = req.body;
    //query para validar autenticacion
    let query =
        "SET @USUARIO=?; SET @ESTADO_AUTENTICACION='0'; SELECT `FT_VERIFICAR_USER_RECUPERACION`(@USUARIO, @ESTADO_AUTENTICACION) AS `FT_VERIFICAR_USER_RECUPERACION`;";
    //Envio del query
    mysqlConnection.query(
        query,
        [USUARIO.toUpperCase()],
        (err, rows, fields) => {
            let Estado = rows[2][0]["FT_VERIFICAR_USER_RECUPERACION"]; //Variable que almacena el valor retornado del procedimiento almacenado
            //console.log(Estado);
            //Condición para verificar si hay o no error en el query
            if (!err) {
                if (Estado == 1) {
                    //Aquí va el código para enviar la contraseña al usuario por medio del correo
                    res.send("EXISTE EL USUARIO");
                } else {
                    res.send("NO EXISTE EL USUARIO");
                }
            } else {
                console.log(err);
            }
        }
    );
});

//Ruta para la recuperación de contraseña por la opción de preguntas, aún se está trabajando
app.post("/RECUPERACION/RESPUESTAS", (req, res) => {
    const { PRE, RES } = req.body;
    let objeto = [];
    //query para validar autenticacion
    let query ="SET @PRE=?; SET @RES=?; SET @p2='0'; SELECT `FT_AUTENTICAR_RESPUESTA`(@PRE, @RES, @p2) AS `FT_AUTENTICAR_RESPUESTA`;";
    //Envio del query
    mysqlConnection.query(
        query,
        [PRE.toUpperCase(),RES.toUpperCase()],
        (err, rows, fields) => {
            //Condición para verificar si hay o no error en el query
            if (!err) {
                let Estado = rows[3][0]["FT_AUTENTICAR_RESPUESTA"]; //Variable que almacena el valor retornado del procedimiento almacenado
                console.log(rows[3][0].FT_AUTENTICAR_RESPUESTA);
                objeto.push(Estado);
                res.send(objeto);
            } else {
                console.log(err);
            }
        }
    );
});


/*app.post("/RECUPERACION/PREGUNTAS", (req, res) => {
    const { USUARIO, RESPUESTA } = req.body;
    //query para validar autenticacion
    let query =
        "SET @USUARIO=?; SET @RESPUESTA=?; SELECT `FT_AUTENTICAR_RESPUESTA`(@USUARIO, @RESPUESTA,0) AS `FT_AUTENTICAR_RESPUESTA`;";
    //Envio del query
    mysqlConnection.query(
        query,
        [USUARIO.toUpperCase(), RESPUESTA],
        (err, rows, fields) => {
            let Estado = rows[2][0]["FT_AUTENTICAR_RESPUESTA"]; //Variable que almacena el valor retornado del procedimiento almacenado
            console.log(Estado);
            //Condición para verificar si hay o no error en el query
            if (!err) {
                if (Estado == 1) {
                    res.send("PREGUNTA CORRECTA");
                } else {
                    res.send("PREGUNTA INCORRECTA");
                }
            } else {
                console.log(err);
            }
        }
    );
});
*/

//Ruta para obtener la preguntas del usuario si falla la respuesta o ambas contraseñas no coinciden
app.post("/OBTENER/RESPUESTAS", (req, res) => {
    const { PRE } = req.body;
    let objeto = [];
    //query para validar autenticacion
    let query ="SET @PRE=?; CALL `PRO_OBTENER_PREGUNTAS`(@PRE);";
    //Envio del query
    mysqlConnection.query(
        query,
        [PRE.toUpperCase()],
        (err, rows, fields) => {
            //Condición para verificar si hay o no error en el query
            if (!err) {
                //let Estado = rows[3][0]["FT_AUTENTICAR_RESPUESTA"]; //Variable que almacena el valor retornado del procedimiento almacenado
                //console.log(rows[3][0].FT_AUTENTICAR_RESPUESTA);
                //objeto.push(Estado);
                //res.send(objeto);
                let retorno = [];
                let filas = rows[1];
                filas.forEach((element) => {
                    retorno.push(element.PREGUNTA);
                    console.log(element.PREGUNTA);
                });
                res.send(retorno);

            } else {
                console.log(err);
            }
        }
    );
});

//Ruta para ingresar las preguntas y respuestas, solo si el usuario existe
app.post("/INSERT/PREGUNTAS", (req, res) => {
    const { USUARIO, PRE_1, RES_1, PRE_2, RES_2, PRE_3, RES_3 } = req.body;
    let objeto = [];
    //query para validar autenticacion
    let query ="SET @USUARIO=?; SET @PRE_1=?; SET @RES_1=?; SET @PRE_2=?; SET @RES_2=?; SET @PRE_3=?; SET @RES_3=?; SET @ESTADO='0'; SELECT `FT_VERI_USER_INSERT_PREGUNTAS2`(@USUARIO, @PRE_1, @RES_1, @PRE_2, @RES_2, @PRE_3, @RES_3, @ESTADO) AS `FT_VERI_USER_INSERT_PREGUNTAS`;"//Envio del query
    mysqlConnection.query(
        query,
        [USUARIO.toUpperCase(), PRE_1.toUpperCase(), RES_1.toUpperCase(), PRE_2.toUpperCase(), RES_2.toUpperCase(), PRE_3.toUpperCase(), RES_3.toUpperCase()], (err, rows, fields) => {
            //Condición para verificar si hay o no error en el query
            if (!err) {
                let Estado = rows[8][0].FT_VERI_USER_INSERT_PREGUNTAS; //Variable que almacena el valor retornado del procedimiento almacenado
                objeto.push(Estado);
                console.log(Estado);
                res.send(objeto);
            } else {
                console.log(err);
            }
        }
    );
});

//Ruta para validar el correo por medio de la interfaz recuperar contraseña ingresando el correo
app.post("/VALIDAR_CORREO", (req, res) => {
    const { CORREO } = req.body;
    let objeto = [];
    //query para validar autenticacion
    let query ="SET @CORREO=?; SET @p1='0'; SELECT `FT_VALIDAR_CORREO`(@CORREO, @p1) AS `FT_VALIDAR_CORREO`;"//Envio del query
    mysqlConnection.query(
        query,
        [CORREO], (err, rows, fields) => {
            //Condición para verificar si hay o no error en el query
            if (!err) {
                let Estado = rows[2][0].FT_VALIDAR_CORREO; //Variable que almacena el valor retornado del procedimiento almacenado
                //console.log(rows[2][0].FT_VALIDAR_CORREO);
                objeto.push(Estado);
                console.log(Estado);
                res.send(objeto);
            } else {
                console.log(err);
            }
        }
    );
});

//Ruta para validar si la contraseña existe
app.post("/VALIDAR_CONTRA", (req, res) => {
    const { ACTUAL_CONTRA } = req.body;
    let objeto = [];
    //query para validar autenticacion
    let query ="SET @ACTUAL_CONTRA=?; SET @p1='0'; SELECT `FT_VALIDAR_CONTRA`(@ACTUAL_CONTRA, @p1) AS `FT_VALIDAR_CONTRA`;"//Envio del query
    mysqlConnection.query(
        query,
        [ACTUAL_CONTRA], (err, rows, fields) => {
            //Condición para verificar si hay o no error en el query
            if (!err) {
                let Estado = rows[2][0].FT_VALIDAR_CONTRA; //Variable que almacena el valor retornado del procedimiento almacenado
                //console.log(rows[2][0].FT_VALIDAR_CONTRA);
                objeto.push(Estado);
                //console.log(Estado);
                res.send(objeto);
            } else {
                console.log(err);
            }
        }
    );
});


//RUTA PARA ENVIAR LAS PREGUNTAS A LA PANTALLA PREGUNTAS
app.post("/RECUPERACION/PREGUNTAS", (req, res) => {
    const { CORREO } = req.body;
    //query para validar autenticacion
    let query = "SET @CORREO=?; CALL `PRO_OBTENIENDO_PREGUNTAS`(@CORREO);";
    //Envio del query
    mysqlConnection.query(
        query,
        [CORREO],
        (err, rows, fields) => {
            //Condición para verificar si hay o no error en el query
            if (!err) {
                let retorno = [];
                let filas = rows[1];
                filas.forEach((element) => {
                    retorno.push(element.PREGUNTA);
                    console.log(element.PREGUNTA);
                });
                res.send(retorno);
            } else {
                console.log(err);
            }
        }
    );
});

app.post("/CLIENTE", (req, res) => {
    const {
        NOM_PRIMERO,
        NOM_SEGUNDO,
        APE_PRIMERO,
        APE_SEGUNDO,
        NUM_TELEFONO,
        COD_TIP_PERSONA,
        DES_DIRECCION,
    } = req.body;
    console.log(
        NOM_PRIMERO,
        NOM_SEGUNDO,
        APE_PRIMERO,
        APE_SEGUNDO,
        NUM_TELEFONO,
        COD_TIP_PERSONA,
        DES_DIRECCION
    );
    var sql =
        "SET @NOM_PRIMERO=?; SET @NOM_SEGUNDO=?; SET @APE_PRIMERO=?; SET @APE_SEGUNDO=?; SET @NUM_TELEFONO=?; SET @COD_TIP_PERSONA=?; SET @DES_DIRECCION=?; CALL INS_clientes(@NOM_PRIMERO, @NOM_SEGUNDO, @APE_PRIMERO, @APE_SEGUNDO, @NUM_TELEFONO, @COD_TIP_PERSONA, @DES_DIRECCION);";

    mysqlConnection.query(
        sql,
        [
            NOM_PRIMERO,
            NOM_SEGUNDO,
            APE_PRIMERO,
            APE_SEGUNDO,
            NUM_TELEFONO,
            COD_TIP_PERSONA,
            DES_DIRECCION,
        ],
        (err, rows, fields) => {
            if (!err) {
                res.send("Insertion completed");
                //console.log(req.body);
            } else {
                console.log(err);
            }
        }
    );
});
//----------------Samuel--------------------------------
app.get("/INVENTARIO/TIPREPUESTO", (req, res) => {
    mysqlConnection.query(
        "SELECT COD_TIP_REPUESTO, NOM_TIP_REPUESTO FROM INV_TIP_REPUESTO;",
        (err, rows) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

app.get("/INVENTARIO/TIPDISPOSITIVO", (req, res) => {
    mysqlConnection.query(
        "SELECT COD_TIP_DISPOSITIVO AS COD, NOM_TIP_DISPOSITIVO AS TIP FROM INV_TIP_DISPOSITIVO;",
        (err, rows) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

app.get("/INVENTARIO/TODOS", (req, res) => {
    mysqlConnection.query(
        `SELECT I.COD_INVENTARIO, I.NOM_INVENTARIO, I.DES_INVENTARIO, I.CAN_INVENTARIO, I.VAL_PRECIO_VENTA, I.FEC_INGRESO, I.MODELO, NOM_TIP_REPUESTO, NOM_TIP_DISPOSITIVO, I.TIP_INVENTARIO
        FROM inv_inventario AS I
        JOIN INV_TIP_REPUESTO as TR ON TR.COD_TIP_REPUESTO = I.COD_TIP_REPUESTO
        JOIN INV_TIP_DISPOSITIVO as TD ON TD.COD_TIP_DISPOSITIVO = I.COD_TIP_DISPOSITIVO;`,
        (err, rows) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

app.get("/INVENTARIO/EDITAR/:id", (req, res) => {
    let param = req.params;
    let id = param.id;
    mysqlConnection.query(
        `SELECT I.COD_INVENTARIO, I.NOM_INVENTARIO, I.DES_INVENTARIO, I.CAN_INVENTARIO, I.VAL_PRECIO_VENTA, I.FEC_INGRESO, I.MODELO, NOM_TIP_REPUESTO, NOM_TIP_DISPOSITIVO, I.TIP_INVENTARIO
        FROM inv_inventario AS I
        JOIN INV_TIP_REPUESTO as TR ON TR.COD_TIP_REPUESTO = I.COD_TIP_REPUESTO
        JOIN INV_TIP_DISPOSITIVO as TD ON TD.COD_TIP_DISPOSITIVO = I.COD_TIP_DISPOSITIVO WHERE COD_;`, id,
        (err, rows) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

//Obtener los datos del usuario según el id
app.get("/USUARIO/OBTENER/:id", (req, res) => {
    let param = req.params;
    let id = param.id;
    mysqlConnection.query(
        `SELECT P.COD_PERSONA, P.NOM_PRIMERO, P.NOM_SEGUNDO, P.APE_PRIMERO, P.APE_SEGUNDO, P.FEC_NACIMIENTO, P.IND_CIVIL,
        P.SEXO, P.COD_DNI, D.DES_DIRECCION, P.RUTA_FOTO, P.FEC_NACIMIENTO, U.USUARIO, P.COD_TIP_PERSONA, U.CORREO_ELECTRONICO,
        U.CON_USUARIO,E.COD_ESPECIALIDAD, E.NOM_ESPECIALIDAD, T.NUM_TELEFONO, T.TIP_TELEFONO, T.COD_TELEFONO
        FROM pr_persona P
        JOIN PR_USUARIO U ON U.COD_PERSONA = P.COD_PERSONA
        JOIN PR_DIRECCION D ON D.COD_PERSONA = U.COD_PERSONA
        JOIN PR_TELEFONO T ON D.COD_PERSONA = T.COD_PERSONA
        LEFT JOIN PR_TECNICO_ESPECIALIDAD TE ON TE.COD_PERSONA = T.COD_PERSONA
        LEFT JOIN pr_especialidad E ON E.COD_ESPECIALIDAD = TE.COD_ESPECIALIDAD
        WHERE U.COD_PERSONA = ?;`,
        id,
        (err, rows) => {
            if (!err) {
                res.send(rows);
            } else {
                res.send("Ha habido un error");
            }
        }
    );
});

//Eliminar el usuario según del cod_persona
app.delete("/USUARIO/BORRAR/:id", (req, res) => {
    let param = req.params;
    let id = param.id;
    mysqlConnection.query(`
    DELETE FROM pr_telefono WHERE COD_PERSONA = ?;
    DELETE FROM pr_direccion WHERE COD_PERSONA = ?;
    DELETE FROM pr_tecnico_especialidad WHERE COD_PERSONA = ?;
    DELETE FROM pr_usuario WHERE COD_PERSONA = ?;
    DELETE FROM pr_persona WHERE COD_PERSONA = ?;
    `,
        [id, id, id, id, id],
        (err, rows) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});


//Eliminar el usuario según del cod_persona
app.post("/USUARIO/ACTUALIZAR", (req, res) => {
    let v = req.body;
    mysqlConnection.query(`
    CALL PROC_ACTUALIZAR_USUARIOS(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
    `,
        [v.cod_persona,v.nom_primero,v.nom_segundo,v.ape_primero, v.ape_segundo, v.cod_dni, v.fec_nacimiento, v.sexo, v.ind_civil, v.cod_rol, v.usuario, v.con_usuario, v.correo_electronico, v.cod_especialidad, v.cod_telefono, v.cod_telefono_2, v.num_telefono, v.num_telefono_2, v.des_direccion],
        (err, rows) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

//Validar si el usuario ya existe en la base de datos
app.get("/USUARIO/USERNAME/:nom", (req, res) => {
    let param = req.params.nom;
    mysqlConnection.query(
        `
    SELECT COD_PERSONA FROM PR_USUARIO WHERE USUARIO = ?;`,
        param,
        (err, rows) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

app.get("/USUARIO/VIGENCIA", (req, res) => {
    mysqlConnection.query(
        `
    SELECT VALOR FROM SE_PARAMETROS WHERE PARAMETRO = "ADMIN_DIAS_VIGENCIA";`,
        (err, rows) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

//Obtener todos los números de telefono de un usuario
app.get("/USUARIO/TELEFONOS/:id", (req, res) => {
    let id = req.params.id;
    mysqlConnection.query(
        "SELECT COD_TELEFONO, NUM_TELEFONO, TIP_TELEFONO FROM PR_TELEFONO WHERE COD_PERSONA = ?;",
        id,
        (err, rows) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

//Obtener todos los empleados existenes
app.get("/USUARIOS_TODOS", (req, res) => {
    mysqlConnection.query(
        `
    SELECT P.COD_PERSONA AS COD_PERSONA,P.NOM_PRIMERO AS NOM_PRIMERO, P.NOM_SEGUNDO AS NOM_SEGUNDO, P.APE_PRIMERO AS APE_PRIMERO,
    P.APE_SEGUNDO AS APE_SEGUNDO, date(U.FEC_ULTIMA_CONEXION) AS FECHAU, TIME(U.FEC_ULTIMA_CONEXION) as HORAU, IU.NOM_IND_USUARIO AS IND_USUARIO, TP.NOM_TIP_PERSONA AS TIP_PERSONA
    FROM PR_PERSONA P
    JOIN PR_TIP_PERSONA TP on TP.COD_TIP_PERSONA = P.COD_TIP_PERSONA
    JOIN PR_USUARIO U on U.COD_PERSONA = P.COD_PERSONA
    JOIN PR_IND_USUARIO IU on IU.IND_USUARIO = U.IND_USUARIO;
    `,
        (err, rows, fields) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

//Obtener los roles_link
app.get("/ROLES", (req, res) => {
    mysqlConnection.query(
        `
    SELECT * FROM SE_ROLES;
    `,
        (err, rows) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

//Obtener las especialidades de los técnicos
app.get("/ESTADOS_USUARIO", (req, res) => {
    mysqlConnection.query(
        `
    SELECT * FROM PR_IND_USUARIO;
    `,
        (err, rows) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

//Obtener las especialidades de los técnicos
app.get("/ESPECIALIDADES", (req, res) => {
    mysqlConnection.query(
        `
    SELECT * FROM PR_ESPECIALIDAD;
    `,
        (err, rows) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

//Obtener la suma de las ordenes segun su vista
app.get("/NUMERO/ORDENES/:id", (req, res) => {
    let param = req.params;
    let id = param.id;
    mysqlConnection.query(
        `
    SELECT count(*) as suma FROM rp_orden_trabajo where cod_ind_reparacion = ?;
    `,
        id,
        (err, rows) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

//Obtener la suma de las ordenes del técnicos
app.get("/NUMERO/ORDENES/TECNICO/:ind/:id", (req, res) => {
    let param = req.params;
    let ind = param.ind;
    let id = param.id;
    mysqlConnection.query(
        `
        SELECT count(*) as suma FROM pr_tecnico_orden_trabajo t1 JOIN rp_orden_trabajo t2 ON t2.COD_ORDEN = t1.COD_ORDEN
        where cod_ind_reparacion = ? and t1.COD_PERSONA = ?;
    `,
        [ind, id],
        (err, rows) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

//-----------------------------------------------
//Introducir: la orden de trabajo, los nuevos clientes, el diagnóstico, la factura, el modelo y la marca
app.post("/ORDEN", (req, res) => {
    const {
        COD_TIP_PERSONA,
        COD_ESTADO_COMISION,
        COD_TIP_ORDEN,
        COSTO_REPARACION,
        COD_ESTADO_REPARACION,
        DESARMADO_POR,
        FEC_INGRESO,
        FEC_ESTIMADA_ENTREGA,
        IMEI,
        DIAGNOSTICO,
        Descripcion_Diagnostico,
        NOM_MARCA,
        NOM_MODELO,
        NOM_FACTURA,
        FEC_EMISION,
        DES_FACTURA,
        NUM_RTN,
        DIR_FACTURA,
        VAL_SUBTOTAL,
        VAL_IMPUESTO,
        FEC_GARANTIA,
        TIP_PAGO,
        NOM_PRIMERO,
        NOM_SEGUNDO,
        APE_PRIMERO,
        APE_SEGUNDO,
        NUM_TELEFONO,
        DES_DIRECCION,
        REVISADO_OTRO_TALLER,
        TOT_PAGAR,
        AUDIO,
        SENAL,
        WIFI,
        HUELLA,
        FLASH,
        BOTONES,
        CARGA,
        VIBRADOR,
        CAMARA,
        PANTALLA,
        BLUETOOTH,
        TORNILLOS,
    } = req.body;
    let sql = `SET @COD_TIP_PERSONA = ?; SET @Codigo_Estado_Comision = ?; SET @Codigo_Tipo_Orden = ?; SET @Costo_Reparacion = ?; SET @Codigo_Estado_Reparaciones = ?; SET @Desarmado_Por = ?; SET @Fecha_Ingreso = ?; SET @Fecha_Estimada_Entrega = ?; SET @IMEI_Celular = ?; SET @Diagnostico = ?; SET @Descripcion_Diagnostico = ?; SET @Nombre_Marca = ?; SET @Nombre_Modelo = ?; SET @Nombre_Factura = ?; SET @Fecha_Emision = ?; SET @Descuento_Factura = ?; SET @Numero_RTN = ?; SET @Dir_Factura = ?; SET @Valor_Subtotal = ?; SET @Valor_Impuesto = ?; SET @Fecha_Garantia = ?; SET @Tipo_Pago = ?; SET @NOMBRE_PRIMERO = ?; SET @NOMBRE_SEGUNDO = ?; SET @APELLIDO_PRIMERO = ?; SET @APELLIDO_SEGUNDO = ?; SET @NUM_TELEFONO = ?; SET @DES_DIRECCION = ?; SET @RevisadoOtroTaller = ?; SET @TotalPagar = ?; SET @Audio = ?; SET @Senal = ?; SET @WiFi = ?; SET @Huella = ?; SET @Flash = ?; SET @Botones = ?; SET @Carga = ?; SET @Vibrador = ?; SET @Camara = ?; SET @Pantalla = ?; SET @Bluetooth = ?; SET @Tornillos = ?;
    CALL PROC_REGISTRAR_ORDEN(@COD_TIP_PERSONA, @Codigo_Estado_Comision, @Codigo_Tipo_Orden, @Costo_Reparacion, @Codigo_Estado_Reparaciones, @Desarmado_Por, @Fecha_Ingreso, @Fecha_Estimada_Entrega, @IMEI_Celular, @Diagnostico, @Descripcion_Diagnostico, @Nombre_Marca, @Nombre_Modelo,  @Nombre_Factura, @Fecha_Emision, @Descuento_Factura, @Numero_RTN, @Dir_Factura, @Valor_Subtotal, @Valor_Impuesto, @Fecha_Garantia, @Tipo_Pago, @NOMBRE_PRIMERO, @NOMBRE_SEGUNDO , @APELLIDO_PRIMERO, @APELLIDO_SEGUNDO, @NUM_TELEFONO, @DES_DIRECCION , @RevisadoOtroTaller, @TotalPagar, @Audio, @Senal, @WiFi, @Huella, @Flash, @Botones, @Carga, @Vibrador, @Camara, @Pantalla, @Bluetooth, @Tornillos)`;
    mysqlConnection.query(
        sql,
        [
            COD_TIP_PERSONA,
            COD_ESTADO_COMISION,
            COD_TIP_ORDEN,
            COSTO_REPARACION,
            COD_ESTADO_REPARACION,
            DESARMADO_POR,
            FEC_INGRESO,
            FEC_ESTIMADA_ENTREGA,
            IMEI,
            DIAGNOSTICO,
            Descripcion_Diagnostico,
            NOM_MARCA,
            NOM_MODELO,
            NOM_FACTURA,
            FEC_EMISION,
            DES_FACTURA,
            NUM_RTN,
            DIR_FACTURA,
            VAL_SUBTOTAL,
            VAL_IMPUESTO,
            FEC_GARANTIA,
            TIP_PAGO,
            NOM_PRIMERO,
            NOM_SEGUNDO,
            APE_PRIMERO,
            APE_SEGUNDO,
            NUM_TELEFONO,
            DES_DIRECCION,
            REVISADO_OTRO_TALLER,
            TOT_PAGAR,
            AUDIO,
            SENAL,
            WIFI,
            HUELLA,
            FLASH,
            BOTONES,
            CARGA,
            VIBRADOR,
            CAMARA,
            PANTALLA,
            BLUETOOTH,
            TORNILLOS,
        ],
        (err, rows, fields) => {
            if (!err)
                // res.send("Insertion Completed");
                res.send({ Status: "Ingresado Correctamente" });
            else console.log(err);
        }
    );
});

//Procedimiento insertar empleados
app.post("/USUARIOS", (req, res) => {
    let v = req.body;
    let sql = `
    CALL PROC_REGISTRAR_USUARIO(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    mysqlConnection.query(
        sql,
        [
            v.cod_tip_persona,
            v.nom_primero,
            v.nom_segundo,
            v.ape_primero,
            v.ape_segundo,
            v.cod_dni,
            v.fec_nacimiento,
            v.sexo,
            v.ind_civil,
            v.ruta_foto,
            v.cod_rol,
            v.usuario,
            v.con_usuario,
            v.ind_usuario,
            v.fec_creacion_usuario,
            v.fec_ultima_conexion,
            v.fec_vencimiento,
            v.preguntas_contestadas,
            v.num_ingresos,
            v.correo_electronico,
            v.cod_especialidad,
            v.num_telefono,
            v.num_telefono_2,
            v.des_direccion,
        ],
        (err, rows, fields) => {
            if (!err) {
                res.send("Insertion Completed");
            } else {
                console.log(err);
            }
        }
    );
});

//Obtener todos los empleados existenes
app.get("/USUARIOS_TODOS", (req, res) => {
    mysqlConnection.query(
        `
    SELECT P.COD_PERSONA AS COD_PERSONA,P.NOM_PRIMERO AS NOM_PRIMERO, P.NOM_SEGUNDO AS NOM_SEGUNDO, P.APE_PRIMERO AS APE_PRIMERO,
    P.APE_SEGUNDO AS APE_SEGUNDO, U.FEC_ULTIMA_CONEXION AS ULTIMA_CONEXION, IU.NOM_IND_USUARIO AS IND_USUARIO, TP.NOM_TIP_PERSONA AS TIP_PERSONA
    FROM PR_PERSONA P
    JOIN PR_TIP_PERSONA TP on TP.COD_TIP_PERSONA = P.COD_TIP_PERSONA
    JOIN PR_USUARIO U on U.COD_PERSONA = P.COD_PERSONA
    JOIN PR_IND_USUARIO IU on IU.IND_USUARIO = U.IND_USUARIO;`,
        (err, rows, fields) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Obtener los técnicos existentes en la base de datos
app.get("/TECNICOS", (req, res) => {
    mysqlConnection.query(
        "SELECT NOM_PRIMERO FROM PR_PERSONA WHERE COD_TIP_PERSONA = 2",
        (err, rows, fields) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

//Obtener los técnicos que tienen asignada una orden de trabajo
app.get("/TECNICOS_ORDEN", (req, res) => {
    mysqlConnection.query(
        "SELECT COD_PERSONA FROM PR_TECNICO_ORDEN_TRABAJO ORDER BY COD_ORDEN ASC",
        (err, rows, fields) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

//Obtener los tipos de dispositivos existentes en la base de datos
app.get("/TIPO_DISPOSITIVO", (req, res) => {
    mysqlConnection.query(
        "SELECT NOM_TIP_DISPOSITIVO FROM INV_TIP_DISPOSITIVO",
        (err, rows, fields) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

//Obtener los registros sobre las especialidades existentes
app.get("/ESPECIALIDAD", (req, res) => {
    mysqlConnection.query(
        "SELECT NOM_ESPECIALIDAD FROM PR_ESPECIALIDAD",
        (err, rows, fields) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

//Obtener los registros pertenecientes a la tabla de órdenes en proceso
app.get("/ORDENES_EN_PROCESO", (req, res) => {
    mysqlConnection.query(
        "SELECT COD_ORDEN, COD_PERSONA, COD_IND_REPARACION, FEC_INGRESO, FEC_ESTIMADA_ENTREGA FROM rp_orden_trabajo WHERE COD_IND_REPARACION = 1",
        (err, rows, fields) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

app.get("/ORDENES/:id/:ind", (req, res) => {
    let param = req.params;
    let ind = param.ind;
    let id = param.id;
    mysqlConnection.query("SELECT OT.COD_ORDEN AS COD_ORDEN, OT.COD_PERSONA AS COD_PERSONA, OT.COD_IND_REPARACION AS COD_IND_REPARACION, OT.FEC_INGRESO AS FEC_INGRESO, OT.FEC_ESTIMADA_ENTREGA AS FEC_ESTIMADA_ENTREGA, MA.NOM_MARCA as NOM_MARCA, MO.NOM_MODELO as NOM_MODELO, ITD.NOM_TIP_DISPOSITIVO AS NOM_TIP_DISPOSITIVO FROM rp_orden_trabajo AS OT JOIN pr_tecnico_orden_trabajo AS TOT ON TOT.COD_ORDEN = OT.COD_ORDEN JOIN rp_diagnostico AS D ON D.COD_ORDEN = TOT.COD_ORDEN JOIN rp_marca as MA on MA.COD_MARCA = D.COD_MARCA JOIN rp_modelo as MO on MO.COD_MODELO = D.COD_MODELO JOIN INV_TIP_DISPOSITIVO as ITD ON ITD.COD_TIP_DISPOSITIVO = D.COD_TIP_DISPOSITIVO WHERE TOT.COD_PERSONA = ? AND OT.COD_IND_REPARACION = ? ORDER BY OT.FEC_INGRESO DESC;", [id,ind], (err, rows)  => {
        if (!err)
            res.send(rows);
        else console.log(err);
    });
});
app.get("/Orden/Administrador/:id", (req, res) => {

    let param = req.params;
    let id = param.id;
    mysqlConnection.query(
        "SELECT OT.COD_ORDEN AS COD_ORDEN, OT.COD_PERSONA AS COD_PERSONA, OT.COD_IND_REPARACION AS COD_IND_REPARACION, OT.FEC_INGRESO AS FEC_INGRESO, OT.FEC_ESTIMADA_ENTREGA AS FEC_ESTIMADA_ENTREGA, MA.NOM_MARCA as NOM_MARCA, MO.NOM_MODELO as NOM_MODELO, ITD.NOM_TIP_DISPOSITIVO AS NOM_TIP_DISPOSITIVO FROM rp_orden_trabajo AS OT JOIN pr_tecnico_orden_trabajo AS TOT ON TOT.COD_ORDEN = OT.COD_ORDEN JOIN rp_diagnostico AS D ON D.COD_ORDEN = TOT.COD_ORDEN JOIN rp_marca as MA on MA.COD_MARCA = D.COD_MARCA JOIN rp_modelo as MO on MO.COD_MODELO = D.COD_MODELO JOIN INV_TIP_DISPOSITIVO as ITD ON ITD.COD_TIP_DISPOSITIVO = D.COD_TIP_DISPOSITIVO WHERE OT.COD_IND_REPARACION = ? ORDER BY OT.FEC_INGRESO DESC;", id, (err, rows) => {

        if (!err){
            res.send(rows);
        }else{
            res.send("Ha habido un error");
        }

    })

    });

//Obtener el código de seguimiento dependiendo deL ESTADO DE la orden
app.get("/Orden/Seguimiento/:id", (req, res) => {

    let param = req.params;
    let id = param.id;
    mysqlConnection.query(
        "SELECT cod_seguimiento_dispositivo, COD_ORDEN FROM rp_seguimiento_dispositivo INNER JOIN rp_orden_trabajo USING (COD_ORDEN) WHERE COD_IND_REPARACION = ? ORDER BY FEC_INGRESO DESC;", id, (err, rows) => {

        if (!err){
            res.send(rows);
        }else{
            res.send("Ha habido un error");
        }

    })

    });

//Obtener diferentes columnas de la tabla historial seguimientos
app.get("/Orden/Historial_notificaciones/:id", (req, res) => {
    let param = req.params;
    let id = param.id;
    mysqlConnection.query(
        "SELECT TRABAJO_REALIZADO, FEC_SEGUIMIENTO FROM rp_historial_seguimiento WHERE COD_SEGUIMIENTO_DISPOSITIVO = ? ORDER BY FEC_SEGUIMIENTO ASC",
        id,
        (err, rows) => {
            if (!err) {
                res.send(rows);
            } else {
                res.send("Ha habido un error");
            }
        }
    );
});

app.get("/Ord/Seguimiento/:id", (req, res) => {
    let param = req.params;
    let id = param.id;
    mysqlConnection.query(
        "SELECT t1.TRABAJO_REALIZADO, t1.FEC_SEGUIMIENTO, t1.COD_SEGUIMIENTO_DISPOSITIVO, t2.COD_ORDEN FROM rp_historial_seguimiento t1 JOIN rp_seguimiento_dispositivo t2 ON t2.COD_SEGUIMIENTO_DISPOSITIVO = t1.COD_SEGUIMIENTO_DISPOSITIVO WHERE t2.COD_ORDEN = ?;",
        id,
        (err, rows) => {
            if (!err) {
                res.send(rows);
            } else {
                res.send("Ha habido un error");
            }
        }
    );
});

app.get("/Ord/Seguimiento_Tecnico/:id", (req, res) => {
    let param = req.params;
    let id = param.id;
    mysqlConnection.query(
        "SELECT t1.NOM_PRIMERO, t1.APE_PRIMERO FROM pr_persona t1 JOIN pr_tecnico_orden_trabajo t2 ON t1.COD_PERSONA = t2.COD_PERSONA WHERE t2.COD_ORDEN = ?;",
        id,
        (err, rows) => {
            if (!err) {
                res.send(rows);
            } else {
                res.send("Ha habido un error");
            }
        }
    );
});

app.get("/Orden/Tecnico_Asignado/:id", (req, res) => {
    let param = req.params;
    let id = param.id;
    mysqlConnection.query(
        "SELECT NOM_PRIMERO, APE_PRIMERO FROM pr_persona INNER JOIN pr_tecnico_orden_trabajo USING (COD_PERSONA) WHERE COD_PERSONA = ? ORDER BY COD_ORDEN ASC",
        id,
        (err, rows) => {
            if (!err) {
                res.send(rows);
            } else {
                res.send("Ha habido un error");
            }
        }
    );
});

app.post("/ORDEN/ACEPTADA", (req, res) => {
    const {id} = req.body;
    mysqlConnection.query("UPDATE rp_orden_trabajo SET COD_IND_REPARACION = 2 WHERE COD_ORDEN = ?;",[id], (err, rows) => {
        if (!err) res.send(rows);
        else console.log(err);
    });
});

app.post("/ORDEN/FINALIZADA", (req, res) => {
    const {id} = req.body;
    mysqlConnection.query("UPDATE rp_orden_trabajo SET COD_IND_REPARACION = 3 WHERE COD_ORDEN = ?;",[id], (err, rows) => {
        if (!err) res.send(rows);
        else console.log(err);
    });
});



//Obtener el nombre del cliente sobre la respectiva orden

app.get("/CLIENTE_ORDEN", (req, res) => {
    const { cod_persona } = req.body;
    mysqlConnection.query(
        "SELECT NOM_PRIMERO, NOM_SEGUNDO, APE_PRIMERO, APE_SEGUNDO FROM PR_PERSONA",
        (err, rows, fields) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

app.get("/Cliente/Orden/:id", (req, res) => {
    let param = req.params;
    let id = param.id;
    mysqlConnection.query(
        "SELECT NOM_PRIMERO, NOM_SEGUNDO, APE_PRIMERO, APE_SEGUNDO FROM PR_PERSONA WHERE COD_PERSONA = ?",
        id,
        (err, rows) => {
            if (!err) {
                res.send(rows);
            } else {
                res.send("Ha habido un error");
            }
        }
    );
});

//OBTENER EL SEGUIMIENTO QUE EL CLIENTE NECESITA


app.get("/Cliente/Seguimiento/:id", (req, res) => {
    let param = req.params;
    let id = param.id;
    mysqlConnection.query(
        "SELECT P.NOM_PRIMERO AS NOM_PRIMERO, P.NOM_SEGUNDO AS NOM_SEGUNDO, P.APE_PRIMERO AS APE_PRIMERO, P.APE_SEGUNDO AS APE_SEGUNDO, IR.NOM_IND_REPARACION AS NOM_IND_REPARACION, OT.FEC_INGRESO AS FEC_INGRESO, OT.FEC_ESTIMADA_ENTREGA AS FEC_ESTIMADA_ENTREGA, MA.NOM_MARCA as NOM_MARCA, MO.NOM_MODELO as NOM_MODELO, ITD.NOM_TIP_DISPOSITIVO AS NOM_TIP_DISPOSITIVO FROM PR_PERSONA AS P JOIN rp_orden_trabajo as OT on OT.COD_PERSONA = P.COD_PERSONA JOIN rp_ind_reparacion AS IR on IR.COD_IND_REPARACION = OT.COD_IND_REPARACION JOIN rp_diagnostico AS D ON D.COD_ORDEN = OT.COD_ORDEN JOIN rp_marca as MA on MA.COD_MARCA = D.COD_MARCA JOIN rp_modelo as MO on MO.COD_MODELO = D.COD_MODELO JOIN INV_TIP_DISPOSITIVO as ITD ON ITD.COD_TIP_DISPOSITIVO = D.COD_TIP_DISPOSITIVO WHERE OT.COD_ORDEN = ?;",
        id,
        (err, rows) => {
            if (!err) {
                res.send(rows);
            } else {
                res.send("Ha habido un error");
            }
        }
    );
});





//

app.get("/TIPREPUESTO", (req, res) => {
    mysqlConnection.query(
        "SELECT COD_TIP_REPUESTO AS COD, NOM_TIP_REPUESTO AS TIP FROM INV_TIP_REPUESTO;",
        (err, rows) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

app.get("/PERRO", (req, res) => {
    mysqlConnection.query(
        "SELECT * FROM PR_PERSONA;",
        (err, rows) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});

app.get("/PERSONAS", (req, res) => {
    mysqlConnection.query("SELECT * FROM PR_PERSONA", (err, rows, fields) => {
        if (!err) res.send(rows);
        else console.log(err);
    });
});

//SELECT NOM_PRIMERO, NOM_SEGUNDO, APE_PRIMERO, APE_SEGUNDO FROM pr_persona INNER JOIN rp_orden_trabajo USING (COD_PERSONA) WHERE COD_PERSONA = 4;

//insertar registros en la tabla seguimiento y el historial
app.post("/SEGUIMIENTO", (req, res) => {
    const {
        cod_orden,
        des_seguimiento_dispositivo,
        img_fotografia,
        fec_seguimiento,
    } = req.body;
    let sql = `SET @CODIGO_ORDEN = ?; SET @DESCRIPCION_SEGUIMIENTO= ?; SET @IMAGEN_FOTOGRAFIA = ?; SET @FECHA_SEGUIMIENTO = ?;
    CALL PROC_ACTUALIZAR_ORDEN(@CODIGO_ORDEN, @DESCRIPCION_SEGUIMIENTO, @IMAGEN_FOTOGRAFIA, @FECHA_SEGUIMIENTO)`;
    mysqlConnection.query(
        sql,
        [
            cod_orden,
            des_seguimiento_dispositivo,
            img_fotografia,
            fec_seguimiento,
        ],
        (err, rows, fields) => {
            if (!err) {
                res.send("Usuario Actualizado");
            } else {
                console.log(err);
            }
        }
    );
});

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

app.get("/TOTALES/:mes/:anio", (req, res) => {
    let param = req.params;
    let mes = param.mes;
    let anio = param.anio;
    let anio2 = anio - 1;
    let datos = {};
    let array = [];
    let len = parseInt(mes) - 5;
    let contp = 1;
    let cont = parseInt(mes); //
    let cont2 = 0; //son las posiciones del arreglo
    let tope = 12;
    let mesNombre, respuesta;
    var total = 0;
    var total2 = 0;

    const totales = [];
    const arrayP = [];
    const meses = [
        "MESES",
        "ENE",
        "FEB",
        "MAR",
        "ABR",
        "MAY",
        "JUN",
        "JUL",
        "AGO",
        "SEP",
        "OCT",
        "NOV",
        "DIC",
    ];

    function getDatos(mes, anio) {
        return new Promise((resolve, reject) => {
            mysqlConnection.query(
                `select sum(TOT_PAGAR) as total from rp_factura where MONTH(FEC_EMISION) = ? AND year(FEC_EMISION) = ? ;`,
                [mes, anio],
                (err, rows) => {
                    if (!err) {
                        total = rows[0].total;
                        resolve(total);
                    } else {
                        console.log(err);
                    }
                }
            );
        });
    }

    async function llenarArreglos() {
        //Recorrer los 6 meses planteados
        for (let i = mes; i >= len; i--) {
            if (i < 1) {
                //mes de año anterior
                const tot = await getDatos(tope, anio2);
                totales.push(tot);
                array[cont2] = tope;
                tope--;
                cont2++;
                // mesNombre = array[cont2];
                // datos[mesNombre] = total;
            } else {
                //mes del año presentecls
                const tot = await getDatos(cont, anio);
                totales.push(tot);
                array[cont2] = cont;
                cont2++;
                cont--;
                // mesNombre = array[cont2];
                // datos[mesNombre] = total;
            }
        }
        console.log("meses", array);
        console.log("totales", totales);

        for (let i = 0; i < array.length; i++) {
            mesNombre = meses[array[i]];
            datos[mesNombre] = totales[i];
        }
        res.send(datos);
    }

    llenarArreglos();
});

//PROCEDIMIENTO INSERTAR INVENTARIO JAFETESPINO ジャフェツ　エスピノ
app.post("/INVENTARIO", (req, res) => {
    const v = req.body;
    let sql = `CALL PROC_REGISTRAR_INVENTARIO(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    mysqlConnection.query(
        sql,
        [
            v.cod_inventario,
            v.cod_tip_dispositivo,
            v.cod_tip_repuesto,
            v.nom_inventario,
            v.des_inventario,
            v.modelo,
            v.tip_inventario,
            v.can_inventario,
            v.val_precio_venta,
            v.fec_ingreso,
            v.fec_salida,
            v.img_fotografia,
            v.des_fotografia,
        ],
        (err, rows, fields) => {
            if (!err) {
                res.send("Insertion Completed");
            } else {
                console.log(err);
            }
        }
    );
});
//TODO:Cambiar el nombre de las rutas según su lógica
//Validar si el usuario ya existe en la base de datos
app.get("/INVENTARIO/EXISTE/:cod", (req, res) => {
    let cod = req.params.cod;
    mysqlConnection.query(
        `
    SELECT COD_INVENTARIO FROM INV_INVENTARIO WHERE COD_INVENTARIO = ?;`,
        cod, (err, rows) => {
            if (!err) res.send(rows);
            else console.log(err);
        }
    );
});


