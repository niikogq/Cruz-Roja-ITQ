const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ObjectId } = require('mongodb');
const { isAuthenticated } = require('../auth/authMiddleware');
const GridFSService = require('../services/gridfsService');

// Configurar multer para memoria
const upload = multer({ storage: multer.memoryStorage() });

// Middleware para inicializar GridFS
router.use((req, res, next) => {
  req.gridfs = new GridFSService(req.app.locals.db);
  next();
});

// POST - Subir foto de perfil de un voluntario específico
router.post('/voluntarios/:voluntarioId/foto', isAuthenticated, upload.single('foto'), async (req, res) => {
  try {
    const { voluntarioId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No se envió archivo' });
    }

    if (!ObjectId.isValid(voluntarioId)) {
      return res.status(400).json({ error: 'ID de voluntario inválido' });
    }

    // Verificar que el voluntario existe
    const db = req.app.locals.db;
    const voluntario = await db.collection('Datos voluntarios').findOne({ _id: new ObjectId(voluntarioId) });
    
    if (!voluntario) {
      return res.status(404).json({ error: 'Voluntario no encontrado' });
    }

    // Si el voluntario ya tiene foto, eliminarla primero
    if (voluntario.fotoId) {
      try {
        await req.gridfs.deleteFile(voluntario.fotoId);
        console.log('✅ Foto anterior eliminada');
      } catch (error) {
        console.error('⚠️ No se pudo eliminar foto anterior:', error);
      }
    }

    // Subir nueva foto
    const fileId = await req.gridfs.uploadFile(
      `foto_${voluntarioId}_${Date.now()}.jpg`,
      req.file.buffer,
      {
        voluntarioId: voluntarioId,
        uploadedBy: req.user.email,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadDate: new Date()
      }
    );

    // Guardar referencia de foto en el voluntario
    await db.collection('Datos voluntarios').updateOne(
      { _id: new ObjectId(voluntarioId) },
      { $set: { fotoId: fileId.toString() } }
    );

    console.log('✅ Foto de perfil subida:', {
      fileId: fileId.toString(),
      voluntarioId: voluntarioId,
      filename: req.file.originalname,
      size: req.file.size
    });

    res.json({
      mensaje: 'Foto de perfil subida exitosamente',
      fotoId: fileId.toString(),
      filename: req.file.originalname
    });
  } catch (error) {
    console.error('❌ Error subiendo foto:', error);
    res.status(500).json({ error: 'Error subiendo foto: ' + error.message });
  }
});

// GET - Descargar foto de perfil de un voluntario
router.get('/voluntarios/:voluntarioId/foto', async (req, res) => {
  try {
    const { voluntarioId } = req.params;

    if (!ObjectId.isValid(voluntarioId)) {
      return res.status(400).json({ error: 'ID de voluntario inválido' });
    }

    // Obtener voluntario y su fotoId
    const db = req.app.locals.db;
    const voluntario = await db.collection('Datos voluntarios').findOne({ _id: new ObjectId(voluntarioId) });
    
    if (!voluntario || !voluntario.fotoId) {
      return res.status(404).json({ error: 'Foto no encontrada para este voluntario' });
    }

    const buffer = await req.gridfs.downloadFile(voluntario.fotoId);

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', 'inline');
    res.send(buffer);

    console.log('✅ Foto descargada:', voluntarioId);
  } catch (error) {
    console.error('❌ Error descargando foto:', error);
    res.status(404).json({ error: 'Foto no encontrada' });
  }
});

// DELETE - Eliminar foto de perfil de un voluntario
router.delete('/voluntarios/:voluntarioId/foto', isAuthenticated, async (req, res) => {
  try {
    const { voluntarioId } = req.params;

    if (!ObjectId.isValid(voluntarioId)) {
      return res.status(400).json({ error: 'ID de voluntario inválido' });
    }

    const db = req.app.locals.db;
    const voluntario = await db.collection('Datos voluntarios').findOne({ _id: new ObjectId(voluntarioId) });
    
    if (!voluntario || !voluntario.fotoId) {
      return res.status(404).json({ error: 'Foto no encontrada para este voluntario' });
    }

    // Eliminar de GridFS
    await req.gridfs.deleteFile(voluntario.fotoId);

    // Eliminar referencia del voluntario
    await db.collection('Datos voluntarios').updateOne(
      { _id: new ObjectId(voluntarioId) },
      { $unset: { fotoId: "" } }
    );

    res.json({ mensaje: 'Foto de perfil eliminada exitosamente' });

    console.log('✅ Foto eliminada para voluntario:', voluntarioId);
  } catch (error) {
    console.error('❌ Error eliminando foto:', error);
    res.status(500).json({ error: 'Error eliminando foto: ' + error.message });
  }
});

// POST - Subir documento (PDF/Word) para título o curso
router.post('/voluntarios/:voluntarioId/documento', isAuthenticated, upload.single('documento'), async (req, res) => {
  try {
    const { voluntarioId } = req.params;
    const { tipo } = req.body; // 'titulo' o 'curso'

    if (!req.file) {
      return res.status(400).json({ error: 'No se envió archivo' });
    }

    if (!ObjectId.isValid(voluntarioId)) {
      return res.status(400).json({ error: 'ID de voluntario inválido' });
    }

    // Verificar que el voluntario existe
    const db = req.app.locals.db;
    const voluntario = await db.collection('Datos voluntarios').findOne({ _id: new ObjectId(voluntarioId) });
    
    if (!voluntario) {
      return res.status(404).json({ error: 'Voluntario no encontrado' });
    }

    // Subir documento a GridFS
    const fileId = await req.gridfs.uploadFile(
      req.file.originalname,
      req.file.buffer,
      {
        voluntarioId: voluntarioId,
        tipo: tipo,
        uploadedBy: req.user.email,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadDate: new Date()
      }
    );

    console.log('✅ Documento subido:', {
      fileId: fileId.toString(),
      voluntarioId: voluntarioId,
      tipo: tipo,
      filename: req.file.originalname,
      size: req.file.size
    });

    res.json({
      mensaje: 'Documento subido exitosamente',
      documentoId: fileId.toString(),
      nombreArchivo: req.file.originalname
    });
  } catch (error) {
    console.error('❌ Error subiendo documento:', error);
    res.status(500).json({ error: 'Error subiendo documento: ' + error.message });
  }
});

// GET - Descargar documento
router.get('/documento/:documentoId', isAuthenticated, async (req, res) => {
  try {
    const { documentoId } = req.params;
    const buffer = await req.gridfs.downloadFile(documentoId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.send(buffer);

    console.log('✅ Documento descargado:', documentoId);
  } catch (error) {
    console.error('❌ Error descargando documento:', error);
    res.status(404).json({ error: 'Documento no encontrado' });
  }
});

module.exports = router;
