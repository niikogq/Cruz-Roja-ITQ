const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

// Importar routers PRIMERO
const filialesTotalsRouter = require('./Routes/filialesTotals');
const voluntariosRouter = require('./Routes/voluntarios');
const filialesRouter = require('./Routes/filiales');
const validacionRouter = require('./Routes/validacionFormularios');
const actualizarEdadesRouter = require('./Routes/actualizarEdades');


//const filialesJerarquicas = require('./Routes/filialesJerarquicas');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const client = new MongoClient('mongodb+srv://ngalloquinchen_db_user:cs9zcjsQEayMMCIm@cruzroja.twuyd12.mongodb.net/?appName=cruzroja');

async function main() {
  await client.connect();
  const db = client.db('cruz_roja_app');
  app.locals.db = db;

  // Registrar rutas
  app.use('/api/filialesTotals', filialesTotalsRouter);
  app.use('/api/voluntarios', voluntariosRouter);
  app.use('/api/filiales', filialesRouter);
  app.use('/api/validacionFormularios', validacionRouter);
  app.use('/api/actualizarEdades', actualizarEdadesRouter);

  //app.use('/api/exportarGoogleWorkspace', require('./Routes/exportarGoogleWorkspace'));
  //app.use('/api/filialesJerarquicas', filialesJerarquicas);

  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
  });
}

main();
