const { GridFSBucket } = require('mongodb');
const { Readable } = require('stream');

class GridFSService {
  constructor(db) {
    this.db = db;
    this.bucket = new GridFSBucket(db);
  }

  // Guardar archivo
  async uploadFile(filename, buffer, metadata = {}) {
    try {
      const stream = this.bucket.openUploadStream(filename, {
        metadata: {
          uploadDate: new Date(),
          ...metadata
        }
      });

      return new Promise((resolve, reject) => {
        const readable = Readable.from(buffer);
        readable.pipe(stream)
          .on('finish', () => {
            console.log(`✅ Archivo guardado en GridFS: ${filename}`);
            resolve(stream.id);
          })
          .on('error', reject);
      });
    } catch (error) {
      console.error('❌ Error subiendo archivo:', error);
      throw error;
    }
  }

  // Obtener archivo
  async downloadFile(fileId) {
    try {
      const { ObjectId } = require('mongodb');
      const stream = this.bucket.openDownloadStream(new ObjectId(fileId));
      
      return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      console.error('❌ Error descargando archivo:', error);
      throw error;
    }
  }

  // Eliminar archivo
  async deleteFile(fileId) {
    try {
      const { ObjectId } = require('mongodb');
      await this.bucket.delete(new ObjectId(fileId));
      console.log(`✅ Archivo eliminado de GridFS: ${fileId}`);
    } catch (error) {
      console.error('❌ Error eliminando archivo:', error);
      throw error;
    }
  }
}

module.exports = GridFSService;
