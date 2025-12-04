const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const passport = require('passport');
const SamlStrategy = require('@node-saml/passport-saml').Strategy; // usa paquete moderno

// Importar routers PRIMERO
const filialesTotalsRouter = require('./Routes/filialesTotals');
const voluntariosRouter = require('./Routes/voluntarios');
const filialesRouter = require('./Routes/filiales');
const validacionRouter = require('./Routes/validacionFormularios');
const actualizarEdadesRouter = require('./Routes/actualizarEdades');

//const filialesJerarquicas = require('./Routes/filialesJerarquicas');

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000', // Ajusta al frontend
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'cruz-roja-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true en producción con HTTPS
}));

const client = new MongoClient('mongodb+srv://ngalloquinchen_db_user:cs9zcjsQEayMMCIm@cruzroja.twuyd12.mongodb.net/?appName=cruzroja');

// Función para generar JWT
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'cruz-roja-jwt-secret-2025';

function generateJWT(user) {
  return jwt.sign(
    { id: user._id, email: user.email, rol: user.rol || 'voluntario' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Middleware para validar JWT en rutas protegidas
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if(!authHeader) return res.status(401).json({ error: 'Token requerido' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
}

async function main() {
  await client.connect();
  const db = client.db('cruz_roja_app');
  app.locals.db = db;

  // Inicializar estrategia SAML
  passport.use(new SamlStrategy({
    callbackUrl: 'http://localhost:3001/api/auth/saml/callback',
    entryPoint: 'https://accounts.google.com/o/saml2/idp?idpid=TU_IDP_ID', // CAMBIAR
    issuer: 'cruz-roja-app',
    cert: 'TU_CERTIFICADO_GOOGLE', // Pegar certificado IdP Google aquí (PEM)
    signatureAlgorithm: 'sha256'
  }, async (profile, done) => {
    try {
      const email = profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || profile.email;
      const user = await db.collection('usuarios').findOne({ email, activo: true });
      if(!user) return done(null, false, { message: 'Usuario no encontrado' });
      done(null, user);
    } catch (err) {
      done(err);
    }
  }));

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.collection('usuarios').findOne({ _id: new ObjectId(id) });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());

  // Rutas SAML
  app.get('/api/auth/saml/login', 
    passport.authenticate('saml', { failureRedirect: '/login?error=auth' })
  );

  app.post('/api/auth/saml/callback',
    passport.authenticate('saml', { failureRedirect: '/login?error=auth' }),
    (req, res) => {
      const token = generateJWT(req.user);
      res.redirect(`http://localhost:3000/?token=${token}`);
    }
  );

  // Rutas existentes (sin borrar nada)
  app.use('/api/filialesTotals', filialesTotalsRouter);
  app.use('/api/voluntarios', voluntariosRouter);
  app.use('/api/filiales', filialesRouter);
  app.use('/api/validacionFormularios', validacionRouter);
  app.use('/api/actualizarEdades', actualizarEdadesRouter);
  // app.use('/api/exportarGoogleWorkspace', require('./Routes/exportarGoogleWorkspace'));
  // app.use('/api/filialesJerarquicas', filialesJerarquicas);

  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
  });
}

main().catch(console.error);
