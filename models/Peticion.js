const mongoose = require('mongoose');

const peticionSchema = new mongoose.Schema({
  radicado: { type: String, required: true, trim: true },
  fechaRadicado: { type: String, required: true },
  tipo: { type: String, required: true },
  peticionario: { type: String, required: true, trim: true },
  correo: { type: String, required: true, trim: true },
  oficio: { type: String, trim: true, default: '' },
  fechaRespuesta: { type: String, default: '' },
  // PDF como base64 (compatible con Vercel - sin filesystem)
  pdfData: { type: String, default: null },
  pdfName: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Peticion', peticionSchema);
