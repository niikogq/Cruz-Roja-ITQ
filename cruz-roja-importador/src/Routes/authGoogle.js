// cruz-roja-importador/src/Routes/authGoogle.js
const express = require('express');
const passport = require('passport');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();

// Cliente para verificar tokens (NUEVO)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// NUEVA RUTA: Para el botón de Google del frontend
// REEMPLAZA la ruta POST /google en authGoogle.js
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verificar el token con Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    // Verificar dominio @cruzroja.cl
    if (!payload.email.endsWith('@cruzroja.cl')) {
      return res.status(403).json({
        success: false,
        message: 'Solo usuarios con correo @cruzroja.cl pueden acceder'
      });
    }
    
    // Buscar o crear usuario en la base de datos
    const db = req.app.locals.db;
    const usuariosCollection = db.collection('usuarios');
    
    let usuario = await usuariosCollection.findOne({ email: payload.email });
    
    if (!usuario) {
      const nuevoUsuario = {
        email: payload.email,
        nombre: payload.name,
        foto: payload.picture,
        googleId: payload.sub,
        fechaRegistro: new Date()
      };
      const result = await usuariosCollection.insertOne(nuevoUsuario);
      usuario = { ...nuevoUsuario, _id: result.insertedId };
    }
    
    // Responder con éxito (sin req.login)
    res.json({
      success: true,
      token: usuario._id.toString(), // Usa el ID como token simple
      user: {
        email: usuario.email,
        nombre: usuario.nombre,
        foto: usuario.foto
      }
    });
    
  } catch (error) {
    console.error('Error verificando token de Google:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido: ' + error.message
    });
  }
});

// Agregar DESPUÉS de la ruta POST /google
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token' });
    }

    const db = req.app.locals.db;
    const { ObjectId } = require('mongodb');
    
    const usuario = await db.collection('usuarios').findOne({ 
      _id: new ObjectId(token) 
    });

    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      user: {
        nombre: usuario.nombre,
        email: usuario.email,
        foto: usuario.foto
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});


// Ruta para iniciar autenticación con Google (EXISTENTE)
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

// Callback de Google OAuth (EXISTENTE)
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

// Logout (EXISTENTE)
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy((err) => {
      if (err) { return next(err); }
      res.clearCookie('connect.sid');
      res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
    });
  });
});

module.exports = router;
