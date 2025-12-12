const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
require('dotenv').config();

// Importar routers PRIMERO
const filialesTotalsRouter = require('./Routes/filialesTotals');
const voluntariosRouter = require('./Routes/voluntarios');
const filialesRouter = require('./Routes/filiales');
const validacionRouter = require('./Routes/validacionFormularios');
const actualizarEdadesRouter = require('./Routes/actualizarEdades');
const authGoogleRouter = require('./Routes/authGoogle');

//const filialesJerarquicas = require('./Routes/filialesJerarquias');

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
    // En producción con HTTPS (Cloud Run) debería ser true
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Cliente MongoDB usando variable de entorno
const client = new MongoClient(process.env.MONGODB_URI);

async function main() {
  await client.connect();
  const db = client.db('cruz_roja_app');
  app.locals.db = db;

  passport.setDB(db);
  app.locals.passport = passport;

   // ✅ 1. RUTAS API Y AUTH PRIMERO (IMPORTANTE)
  app.use('/auth', authGoogleRouter);
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

  // Servir frontend de React (build)
  // Dentro del contenedor, el build se copia a /app/cruz-roja-importador/build
  // y este archivo está en /app/cruz-roja-importador/src
  // Servir archivos estáticos del build
  app.use(express.static(path.join(__dirname, '../build')));

  // Cualquier ruta que no sea /api o /auth → React
  app.get(/^\/(?!api|auth).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });

  // Middleware de manejo de errores (mantiene tu lógica)
  app.use((err, req, res, next) => {
    console.error('Error en la aplicación:', err);
    res.status(err.status || 500).json({
      error: 'Error del servidor',
      message: process.env.NODE_ENV === 'production' 
        ? 'Ha ocurrido un error' 
        : err.message
    });
  });

  const PORT = process.env.NODE_ENV === 'production' ? 8080 : (process.env.PORT || 3001);
  app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
    console.log(`Google OAuth disponible en http://localhost:${PORT}/auth/google`);
    console.log(`Servidor básico OK en puerto ${PORT}`);
  });
}

main().catch(console.error);
