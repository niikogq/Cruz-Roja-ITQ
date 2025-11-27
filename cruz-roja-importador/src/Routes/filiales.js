const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://ngalloquinchen_db_user:cs9zcjsQEayMMCIm@cruzroja.twuyd12.mongodb.net/?appName=cruzroja';
const DB_NAME = 'cruz_roja_app';

// GET - Obtener todas las filiales
router.get('/', async (req, res) => {
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const filiales = await db.collection('Datos filial').find({}).toArray();
    res.json(filiales);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo filiales.' });
  } finally {
    await client.close();
  }
});

// PATCH - Actualizar comentario de una filial
router.patch('/:id', async (req, res) => {
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const { id } = req.params;
    const { Comentarios } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const result = await db.collection('Datos filial').updateOne(
      { _id: new ObjectId(id) },
      { $set: { Comentarios } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Filial no encontrada' });
    }
    res.json({ mensaje: 'Comentario actualizado' });
  } catch (error) {
    console.error('Error en PATCH /api/filiales/:id:', error);
    res.status(500).json({ error: 'Error actualizando filial: ' + error.message });
  } finally {
    await client.close();
  }
});

module.exports = router;