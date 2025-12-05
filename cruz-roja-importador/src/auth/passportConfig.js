const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

module.exports = function(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const db = req.app.locals.db;
          const usuariosCollection = db.collection('usuarios');

          // Extraer información del perfil de Google
          const email = profile.emails[0].value;
          const googleId = profile.id;

          // Verificar si el usuario ya existe
          let usuario = await usuariosCollection.findOne({ 
            $or: [{ googleId }, { email }] 
          });

          if (usuario) {
            // Actualizar última fecha de login
            await usuariosCollection.updateOne(
              { _id: usuario._id },
              { 
                $set: { 
                  ultimoLogin: new Date(),
                  foto: profile.photos[0].value 
                } 
              }
            );
          } else {
            // Crear nuevo usuario
            const nuevoUsuario = {
              googleId: googleId,
              email: email,
              nombre: profile.displayName,
              foto: profile.photos[0].value,
              emailVerificado: profile.emails[0].verified,
              rol: null, // Asignar rol manualmente después
              activo: true,
              fechaRegistro: new Date(),
              ultimoLogin: new Date()
            };

            const result = await usuariosCollection.insertOne(nuevoUsuario);
            usuario = { ...nuevoUsuario, _id: result.insertedId };
          }

          // Convertir ObjectId a string para la sesión
          // // En passportConfig.js, después de obtener userData
          const userData = {
            id: usuario._id.toString(),
            googleId: usuario.googleId,
            email: usuario.email,
            nombre: usuario.nombre,
            foto: usuario.foto,
            rol: usuario.rol,
            activo: usuario.activo
            };

            // Verificar si el usuario está activo
            if (!usuario.activo) {
                return done(null, false, { 
                  message: 'Usuario desactivado. Contacte al administrador.' 
            });
            }

            return done(null, userData);


        } catch (error) {
          console.error('Error en autenticación Google:', error);
          return done(error, null);
        }
      }
    )
  );

  // Serializar usuario en la sesión
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserializar usuario de la sesión
  passport.deserializeUser(async (id, done) => {
    try {
      const { ObjectId } = require('mongodb');
      const db = passport._db; // Guardamos referencia a la DB
      const usuario = await db.collection('usuarios').findOne({ _id: new ObjectId(id) });
      
      if (usuario) {
        const userData = {
          id: usuario._id.toString(),
          googleId: usuario.googleId,
          email: usuario.email,
          nombre: usuario.nombre,
          foto: usuario.foto,
          rol: usuario.rol,
          activo: usuario.activo
        };
        done(null, userData);
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error, null);
    }
  });

  // Método helper para guardar referencia a la DB
  passport.setDB = function(db) {
    passport._db = db;
  };
};
