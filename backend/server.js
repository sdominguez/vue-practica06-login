const express = require('express'); // npm install express 
const mongoose = require('mongoose'); //npm install mongoose
const bodyParser = require('body-parser'); // npm install body-parser
const multer = require('multer'); // npm install multer
const path = require('path'); // npm install path
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // npm install cors
const crypto = require('crypto');
const winston = require('winston');

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


// Configuración de winston
const logger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: path.join(__dirname, 'error.log') })
    ]
  });

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

const errorSchema = new mongoose.Schema({
    error: String,
    info: String,
    url: String,
    date: { type: Date, default: Date.now }
  });

// Creación de Modelos 
const Usuario = mongoose.model('Usuarios',usuarioSchema);

const { Schema } = mongoose;

//Esquema de carga de imagenes
const photoSchema = new Schema({
    data: Buffer,
    contentType: String,
  });
  
  const Photo = mongoose.model('Photo',photoSchema);
  
  const storage = multer.memoryStorage();
  const upload = multer({ storage });


  
  const ErrorLog = mongoose.model('ErrorLog', errorSchema);
  
  app.post('/api/log', (req, res) => {
    const { error, info, url } = req.body;
    const errorLog = new ErrorLog({ error, info, url });
    errorLog.save()
      .then(() => {
        logger.error(`Error: ${error}, Info: ${info}, URL: ${url}`);
        res.status(200).send('Error logged');
      })
      .catch(err => {
        res.status(500).send('Failed to log error');
      });
  });


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
app.post('/new_usuario', async (req, res) => {
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

//Buscar registro por ID
app.post('/buscar-usuario', async(req, res)=>{
    try{
        const {_id} = req.body;
        if(!_id){
            return res.sta|(400).json({mensaje:'requiere de un ID'});
        }
        const usuario = await Usuario.findById(_id);
        if(!usuario){
            return res.status(400).json({
                mensaje: 'ID de Usuario no fue localizado'
            });
        }
        res.json(usuario);
    }catch(error){
        console.error('Error al buscar usuario por ID: ',error);
        res.status(500).json({mensaje:'Error interno del servidor'});
    }
});


app.put('/actualizarusuarioruta/:_id', async(req, res)=>{
    const _id = req.params._id;
    const usuarioActualizado = await Usuario.findByIdAndUpdate(_id, req.body, {new : true});
    if(usuarioActualizado){
        res.json(usuarioActualizado);
    }else{
        res.status(404).json({mensaje:'usuario no fue encontrado'});
    }
});

app.put('/actualizarusuariobody', async(req, res)=>{
    try{
        const {_id, nombre, correo} = req.body;
        if(!_id ||( !nombre && !correo)){
            return res.status(400).json({
                mensaje: 'Se requiere proporcionar ID y al menos campos a actualizar (nombre, correo'
            });
        }
        const usuarioActualizado = await Usuario.findByIdAndUpdate(_id,{nombre, correo}, {new : true});
        if(!usuarioActualizado){
            res.status(404).json({mensaje:'Usuario no fue encontrado'});
        }
        res.json(usuarioActualizado);
    }catch(error){
        console.error('Error al actualizar usuario por ID: ', error);
        res.status(500).json({mensaje:'Error interno del servidor'});
    }
});

//PUT - Editar Información 
app.put('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const actualizaciones = req.body;
        const usuarioActualizado = await Usuario.findByIdAndUpdate(id, actualizaciones, { new: true, runValidators: true });
        
        if (!usuarioActualizado) {
            return res.status(404).send({mensaje: 'Usuario no encontrado' });
        }
        
        res.send(usuarioActualizado);
    } catch (error) {
        res.status(400).send(error);
    }
});


//DELETE - Eliminar Información 

//Enpoint cargar foto
app.post('/upload', upload.single('photo'), async (req, res) => {
    try {
        const newPhoto = new Photo({
            data: req.file.buffer,
            contentType: req.file.mimetype,
        });
        await newPhoto.save();
        res.json({
            mensaje: 'La foto ha sido guardad correctamente'
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al guardar la foto'
        });
    }
});

//Endpoint obtener foto 
app.get('/photo/:id', async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);
        if (!photo) {
            return res.status(404).json({
                mensaje: 'Recurso no encontrado',
            })
        }
        res.set('Content-Type', photo.contentType);
        res.send(photo.data);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener la foto'
        });
    }
});

// app.use('/login', cors(corsOptions));

const PORT = 3000;
app.listen(PORT, ()=>{
    console.log(`\nServidor esta escuchando en puerto ${PORT}`);
});