const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://ngalloquinchen_db_user:cs9zcjsQEayMMCIm@cruzroja.twuyd12.mongodb.net/?appName=cruzroja';
const DB_NAME = 'cruz_roja_app';

router.get('/', async (req, res) => {
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const voluntarios = await db.collection('Datos voluntarios').find({}).toArray();
    res.json(voluntarios);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo los voluntarios.' });
  } finally {
    await client.close();
  }
});

router.patch('/:id', async (req, res) => {
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const { id } = req.params;
    const updateFields = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const result = await db.collection('Datos voluntarios').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Voluntario no encontrado' });
    }
    res.json({ mensaje: 'Actualización exitosa' });
  } catch (error) {
    console.error('Error en PATCH /api/voluntarios/:id:', error);
    res.status(500).json({ error: 'Error actualizando voluntario: ' + error.message });
  } finally {
    await client.close();
  }
});

module.exports = router;
