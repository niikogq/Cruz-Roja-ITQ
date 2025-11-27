const XLSX = require('xlsx');
const { MongoClient } = require('mongodb');

const EXCEL_FILE_PATH = 'C:/Users/nicolas.gallo/Downloads/Cruz Roja/Memorias.xlsx';
const MONGODB_URI = 'mongodb+srv://ngalloquinchen_db_user:cs9zcjsQEayMMCIm@cruzroja.twuyd12.mongodb.net/?appName=cruzroja';
const DB_NAME = 'cruz_roja_app';

// Limpiar espacios en los nombres de campos
function cleanRow(row) {
  const cleaned = {};
  for (let k in row) {
    cleaned[k.trim()] = row[k];
  }
  return cleaned;
}

async function importarExcel() {
  // Leer el archivo Excel
  const workbook = XLSX.readFile(EXCEL_FILE_PATH);

  // Conectar a MongoDB
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    // Recorrer cada hoja del Excel
    for (const sheetName of workbook.SheetNames) {
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      const cleanedData = data.map(cleanRow);

      if (cleanedData.length > 0) {
        console.log(`Eliminando datos anteriores de la colección "${sheetName}"...`);
        await db.collection(sheetName).deleteMany({});

        console.log(`Primeros registros de la hoja "${sheetName}":`);
        console.log(cleanedData.slice(0, 2)); // Solo revisión rápida

        await db.collection(sheetName).insertMany(cleanedData);
        console.log(`Hoja "${sheetName}" importada con éxito (${cleanedData.length} registros).`);
      }
    }
    console.log('¡Importación completada!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

importarExcel();
