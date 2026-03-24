const express = require('express');
const passport = require('passport');
const { OAuth2Client } = require('google-auth-library');
const { getUserOrgUnitPath, determinarRol } = require('../services/directoryService');
const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Ruta para el botón de Google del frontend
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    if (!payload.email.endsWith('@cruzroja.cl')) {
      return res.status(403).json({
        success: false,
        message: 'Solo usuarios con correo @cruzroja.cl pueden acceder'
      });
    }
    
    let rolInfo = null;
    let orgUnitPath = null;
    
    try {
      orgUnitPath = await getUserOrgUnitPath(payload.email);
      rolInfo = determinarRol(orgUnitPath);
      
      if (!rolInfo) {
        console.error('❌ No se pudo determinar rol para:', payload.email);
        return res.status(403).json({
          success: false,
          message: 'Usuario sin rol asignado en la organización'
        });
      }
    } catch (error) {
      console.error('❌ Error verificando permisos:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos del usuario: ' + error.message
      });
    }
    
    const db = req.app.locals.db;
    const usuariosCollection = db.collection('usuarios');
    
    let usuario = await usuariosCollection.findOne({ email: payload.email });
    
    if (!usuario) {
      const nuevoUsuario = {
        email: payload.email,
        nombre: payload.name,
        foto: payload.picture,
        googleId: payload.sub,
        rol: rolInfo.rol,
        region: rolInfo.region,
        filial: rolInfo.filial,
        orgUnitPath: orgUnitPath, 
        fechaRegistro: new Date()
      };
      const result = await usuariosCollection.insertOne(nuevoUsuario);
      usuario = { ...nuevoUsuario, _id: result.insertedId };
      console.log('✅ Nuevo usuario registrado:', payload.email, '- Rol:', rolInfo.rol);
    } else {
      await usuariosCollection.updateOne(
        { email: payload.email },
        { 
          $set: {
            rol: rolInfo.rol,
            region: rolInfo.region,
            filial: rolInfo.filial,
            orgUnitPath: orgUnitPath,
            ultimoAcceso: new Date()
          }
        }
      );
      usuario.rol = rolInfo.rol;
      usuario.region = rolInfo.region;
      usuario.filial = rolInfo.filial;
    }
    
    res.json({
      success: true,
      token: usuario._id.toString(),
      user: {
        email: usuario.email,
        nombre: usuario.nombre,
        foto: usuario.foto,
        rol: usuario.rol,
        region: usuario.region,
        filial: usuario.filial
      }
    });
    
  } catch (error) {
    console.error('❌ Error en autenticación:', error.message);
    res.status(401).json({
      success: false,
      message: 'Token inválido: ' + error.message
    });
  }
});

// Ruta para obtener información del usuario autenticado
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
        email: usuario.email,
        nombre: usuario.nombre,
        foto: usuario.foto,
        rol: usuario.rol,
        region: usuario.region,
        filial: usuario.filial
      }
    });

  } catch (error) {
    console.error('❌ Error en /auth/me:', error.message);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// Ruta para iniciar autenticación con Google
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

// Callback de Google OAuth
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {
    const userId = req.user.id;
    res.redirect(`${process.env.FRONTEND_URL}/?token=${userId}`);
  }
);

// Logout
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
