const mongoose = require('mongoose');

const solicitudSchema = new mongoose.Schema({
  radicado: { type: String, required: true, trim: true },
  fechaRadicado: { type: String, required: true },
  tipo: { type: String, required: true },
  detalle: { type: String, required: true, trim: true },
  solicitante: { type: String, required: true, trim: true },
  correo: { type: String, required: true, trim: true },
  tipoResolucion: { type: String, default: '' },
  numeroResolucion: { type: String, trim: true, default: '' },
  fechaResolucion: { type: String, default: '' },
  fechaNotificacion: { type: String, default: '' },
  // PDF como base64 (compatible con Vercel)
  pdfData: { type: String, default: null },
  pdfName: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Solicitud', solicitudSchema);
