const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { Strategy: SamlStrategy } = require('@node-saml/passport-saml');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { MongoClient, ObjectId } = require('mongodb');

// Importar routers existentes
const filialesTotalsRouter = require('./Routes/filialesTotals');
const voluntariosRouter = require('./Routes/voluntarios');
const filialesRouter = require('./Routes/filiales');
const validacionRouter = require('./Routes/validacionFormularios');
const actualizarEdadesRouter = require('./Routes/actualizarEdades');

const app = express();

// === CONFIG ===
const JWT_SECRET = 'cruz-roja-local-jwt-2025-super-secreto';
const SAML_CONFIG = {
  callbackUrl: 'http://localhost:3001/api/auth/saml/callback',
  entryPoint: 'https://accounts.google.com/o/saml2/idp?idpid=CAMBIAR_POR_TU_IDPID', // ← Google te da esto
  issuer: 'cruz-roja-app',
  // cert: '-----BEGIN CERTIFICATE-----\nPEGA_CERTIFICADO_DE_GOOGLE\n-----END CERTIFICATE-----',
  signatureAlgorithm: 'sha256'
};

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'cruz-roja-local-session-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

const client = new MongoClient('mongodb+srv://ngalloquinchen_db_user:cs9zcjsQEayMMCIm@cruzroja.twuyd12.mongodb.net/?appName=cruzroja');

async function main() {
  await client.connect();
  const db = client.db('cruz_roja_app');
  app.locals.db = db;

  // === FUNCIÓN JWT ===
  function generateJWT(user) {
    return jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        nombre: user.nombre,
        rol: user.rol || 'voluntario',
        rut: user.rut 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  // === LOGIN SIMPLE (RUT o email voluntario) ===
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Buscar voluntario por RUT o Correo
      const voluntario = await db.collection('Datos voluntarios').findOne({
        $or: [
          { RUT: email },
          { Correo: email }
        ]
      });
      
      if (!voluntario) {
        return res.status(401).json({ error: 'Voluntario no encontrado' });
      }
      
      // Crear usuario temporal si no existe
      let user = await db.collection('usuarios').findOne({ 
        $or: [{ email: voluntario.RUT }, { email: voluntario.Correo }] 
      });
      
      if (!user) {
        user = {
          _id: new ObjectId(),
          email: voluntario.RUT || voluntario.Correo,
          nombre: `${voluntario['Nombres voluntario'] || ''} ${voluntario['Apellidos voluntarios'] || ''}`.trim(),
          rut: voluntario.RUT,
          filial: voluntario.Filial,
          rol: 'voluntario',
          activo: true
        };
        await db.collection('usuarios').insertOne(user);
      }
      
      const token = generateJWT(user);
      res.json({ 
        token, 
        user: {
          email: user.email,
          nombre: user.nombre,
          filial: user.filial,
          rol: user.rol
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Error en login' });
    }
  });

  // === SAML LOCALHOST ===
  passport.use(new SamlStrategy(SAML_CONFIG, async (profile, done) => {
    try {
      const email = profile.email || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
      
      let user = await db.collection('usuarios').findOne({ email });
      if (!user) {
        user = {
          _id: new ObjectId(),
          email,
          nombre: profile.name || email,
          rol: 'voluntario',
          activo: true
        };
        await db.collection('usuarios').insertOne(user);
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Error SAML:', error);
      return done(error);
    }
  }));

  passport.serializeUser((user, done) => done(null, user._id.toString()));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.collection('usuarios').findOne({ _id: new ObjectId(id) });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());

  // === RUTAS SAML ===
  app.get('/api/auth/saml/login', 
    passport.authenticate('saml', { failureRedirect: 'http://localhost:3000/?error=saml' })
  );

  app.post('/api/auth/saml/callback',
    passport.authenticate('saml', { failureRedirect: 'http://localhost:3000/?error=saml' }),
    (req, res) => {
      const token = generateJWT(req.user);
      res.redirect(`http://localhost:3000/?token=${token}&user=${encodeURIComponent(req.user.nombre)}`);
    }
  );

  // === MIDDLEWARE JWT PARA APIs ===
  app.use('/api/protected', (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Token inválido' });
    }
  });

  // === RUTAS EXISTENTES ===
  app.use('/api/filialesTotals', filialesTotalsRouter);
  app.use('/api/voluntarios', voluntariosRouter);
  app.use('/api/filiales', filialesRouter);
  app.use('/api/validacionFormularios', validacionRouter);
  app.use('/api/actualizarEdades', actualizarEdadesRouter);
  //app.use('/api/exportarGoogleWorkspace', require('./Routes/exportarGoogleWorkspace'));
  //app.use('/api/filialesJerarquicas', filialesJerarquicas);

  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`🚀 API + SAML LOCAL corriendo en http://localhost:${PORT}`);
    console.log(`🔐 Login simple: POST /api/auth/login {"email": "RUT", "password": "123"}`);
    console.log(`🔗 SAML Login: http://localhost:3001/api/auth/saml/login`);
  });
}

main().catch(console.error);
