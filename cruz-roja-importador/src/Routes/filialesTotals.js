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

    const filialesAgregadas = await db.collection('Datos filial').aggregate([
      {
        $lookup: {
          from: "Datos voluntarios",
          localField: "Filial",
          foreignField: "Filial",
          as: "voluntarios"
        }
      },
      {
        $addFields: {
          "Voluntarios activos": {
            $size: {
              $filter: {
                input: "$voluntarios",
                as: "v",
                cond: { $eq: ["$$v.Calidad de voluntario", "Activo"] }
              }
            }
          },
          "Voluntarios de llamada": {
            $size: {
              $filter: {
                input: "$voluntarios",
                as: "v",
                cond: { $eq: ["$$v.Calidad de voluntario", "Llamada"] }
              }
            }
          }
        }
      },
      {
        $project: {
          voluntarios: 0
        }
      }
    ]).toArray();

    res.json(filialesAgregadas);
  } catch (err) {
    console.error('Error en /api/filialesTotals:', err);
    res.status(500).json({ error: 'Error obteniendo filiales con totales' });
  } finally {
    await client.close();
  }
});

module.exports = router;
