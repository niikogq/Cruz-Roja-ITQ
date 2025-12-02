const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://ngalloquinchen_db_user:cs9zcjsQEayMMCIm@cruzroja.twuyd12.mongodb.net/?appName=cruzroja';
const DB_NAME = 'cruz_roja_app';

// GET - Obtener todos los documentos de Validación formularios
router.get('/', async (req, res) => {
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const resultados = await db.collection('Validación formularios').find({}).toArray();
    res.json(resultados);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo datos validación formularios.' });
  } finally {
    await client.close();
  }
});

module.exports = router;
