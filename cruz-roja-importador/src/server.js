const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

// Importar routers PRIMERO
const filialesTotalsRouter = require('./Routes/filialesTotals');
const voluntariosRouter = require('./Routes/voluntarios');
const filialesRouter = require('./Routes/filiales');
const validacionRouter = require('./Routes/validacionFormularios');
const actualizarEdadesRouter = require('./Routes/actualizarEdades');
const authGoogleRouter = require('./Routes/authGoogle'); // Nueva ruta de autenticación

//const filialesJerarquicas = require('./Routes/filialesJerarquicas');

const app = express();

// Configurar Passport (debe estar antes de usarlo)
require('./auth/passportConfig')(passport);

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true // Permitir cookies en CORS
}));
app.use(express.json());

// Configurar sesiones (ANTES de Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'cruz_roja_secret_2025',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Cambiar a true en producción con HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

const client = new MongoClient('mongodb+srv://ngalloquinchen_db_user:cs9zcjsQEayMMCIm@cruzroja.twuyd12.mongodb.net/?appName=cruzroja');

async function main() {
  await client.connect();
  const db = client.db('cruz_roja_app');
  app.locals.db = db;
  

  passport.setDB(db);
  // Hacer la base de datos disponible en Passport (útil para guardar usuarios)
  app.locals.passport = passport;

  // Registrar rutas de autenticación (SIN protección)
  app.use('/auth', authGoogleRouter);

  // Registrar rutas existentes (sin autenticación por ahora, la agregaremos después)
  app.use('/api/filialesTotals', filialesTotalsRouter);
  app.use('/api/voluntarios', voluntariosRouter);
  app.use('/api/filiales', filialesRouter);
  app.use('/api/validacionFormularios', validacionRouter);
  app.use('/api/actualizarEdades', actualizarEdadesRouter);

  //app.use('/api/exportarGoogleWorkspace', require('./Routes/exportarGoogleWorkspace'));
  //app.use('/api/filialesJerarquicas', filialesJerarquicas);

  // Ruta para verificar estado de autenticación (útil para el frontend)
  app.get('/api/auth/status', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ 
        authenticated: true, 
        user: {
          nombre: req.user.nombre,
          email: req.user.email,
          foto: req.user.foto,
          rol: req.user.rol || null
        }
      });
    } else {
      res.json({ authenticated: false });
    }
  });

  app.use((err, req, res, next) => {
    console.error('Error en la aplicación:', err);
    res.status(err.status || 500).json({
      error: 'Error del servidor',
      message: process.env.NODE_ENV === 'production' 
        ? 'Ha ocurrido un error' 
        : err.message
    });
  });

  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
    console.log(`Google OAuth disponible en http://localhost:${PORT}/auth/google`);
  });
}

main().catch(console.error);