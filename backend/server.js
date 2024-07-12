const express = require('express'); // npm install express 
const mongoose = require('mongoose'); //npm install mongoose
const bodyParser = require('body-parser'); // npm install body-parser
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // npm install cors
const crypto = require('crypto');

const SECRET_KEY = crypto.randomBytes(32).toString('hex');

try{
    console.log(`Clave generada: ${SECRET_KEY}`);
}catch(erro){
    console.log(`Error al generar clave: ${error}`);
}

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'x-token'], // Incluir 'x-token'
    exposedHeaders: ['x-token']
  };

const app = express(); //crear instalacia de una aplicación Express
app.use(cors(corsOptions)); 
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json()); // Analizar cuerpos de solicitudes en formato JSON 

//Generar la Conexón a MongoDB
mongoose.connect('mongodb://localhost:27017/vuejs',
    {
        //useNewUrlParser: true, //
        //useUnifiedTopology: true,  //
    }
);


const db = mongoose.connection;

// Definición de Esquema 

const usuarioSchema = new mongoose.Schema({
    usuario: String,
    correo: String,
    password: String,
    direccion: String,
    nombre: String,
    telefono: String
});

// Creación de Modelos 
const Usuario = mongoose.model('Usuarios',usuarioSchema);

//Pertenencientes a HTTP 

//Crear nuestras urls de datos 

//GET -- Nos devuelve infomormación de la BD 
// http://localhost:3000/usuarios
app.get('/usuarios', async(req,res) =>{
    try {
        const usuarios = await db.collection('usuarios').find().toArray();
        res.json({ usuarios });
        console.log("Respuesta:\n",usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios: ',error);
        res.status(500).json({ error: 'Error Interno del Servidor'});
    }
});


app.post('/login', async(req, res)=>{
    try{
        const {correo, password} = req.body;
        const usuario = await Usuario.findOne({correo, password});
        console.log(`\nEl usuario ${correo} se está intentando loguear...`);
        if(usuario){
            console.log(`Login correcto.`);
            const token = jwt.sign({correo}, SECRET_KEY, {expiresIn: '2h'});
            //res.cookie('token',token,{httpOnly: true, secure:true});
            res.header('x-token', token);
            console.log(`Token enviado en el header: ${token}`);
            res.json(usuario);
        }else{
            res.status(401).json({mensaje: 'Credenciales inválidad'});
        }
    }catch(error){
        console.error('Error en el logueo de usuario', error);
        res.status(500).json({mensaje: 'Error interno en el servidor'});

    }
});

app.post('/rutaprotegida', async(req, res)=>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({mensaje: 'Token no proporcionado'});
    }
    try{
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({mensaje:'Datos protegidos', user: decoded});
    }catch(error){
        return res.status(401).json({message: 'Token Inválido'});
    }

});

//POST - Registrar un dato en nuestra base
app.post('/nuevousuario', async (req, res) => {
    try {
        const usuario = new Usuario({
            id: new mongoose.Types.ObjectId(),
            ...req.body
        });
        const resultado = await usuario.save();
        res.status(201).send(resultado);
    } catch (error) {
        res.status(400).send(error);
    }
});

//PUT - Editar Información 
app.put('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const actualizaciones = req.body;
        const usuarioActualizado = await Usuario.findByIdAndUpdate(id, actualizaciones, { new: true, runValidators: true });
        
        if (!usuarioActualizado) {
            return res.status(404).send({ error: 'Usuario no encontrado' });
        }
        
        res.send(usuarioActualizado);
    } catch (error) {
        res.status(400).send(error);
    }
});

//DELETE - Eliminar Información 


// app.use('/login', cors(corsOptions));

const PORT = 3000;
app.listen(PORT, ()=>{
    console.log(`\nServidor esta escuchando en puerto ${PORT}`);
});