const express = require('express');
const router = express.Router();
const multer = require('multer');
const Solicitud = require('../models/Solicitud');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Solo se permiten archivos PDF'));
  }
});

router.get('/', async (req, res) => {
  try {
    const q = req.query.q || '';
    let filter = {};
    if (q) {
      const regex = new RegExp(q, 'i');
      filter = {
        $or: [
          { radicado: regex },
          { solicitante: regex },
          { correo: regex },
          { tipo: regex },
          { detalle: regex },
          { numeroResolucion: regex }
        ]
      };
    }
    const items = await Solicitud.find(filter)
      .select('-pdfData')
      .sort({ fechaRadicado: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Solicitud.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'No encontrada' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', upload.single('pdf'), async (req, res) => {
  try {
    const data = {
      radicado: req.body.radicado,
      fechaRadicado: req.body.fechaRadicado,
      tipo: req.body.tipo,
      detalle: req.body.detalle,
      solicitante: req.body.solicitante,
      correo: req.body.correo,
      tipoResolucion: req.body.tipoResolucion || '',
      numeroResolucion: req.body.numeroResolucion || '',
      fechaResolucion: req.body.fechaResolucion || '',
      fechaNotificacion: req.body.fechaNotificacion || ''
    };

    if (req.file) {
      data.pdfData = `data:application/pdf;base64,${req.file.buffer.toString('base64')}`;
      data.pdfName = req.file.originalname;
    }

    const item = new Solicitud(data);
    await item.save();
    const obj = item.toObject();
    delete obj.pdfData;
    res.status(201).json(obj);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', upload.single('pdf'), async (req, res) => {
  try {
    const item = await Solicitud.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'No encontrada' });

    item.radicado = req.body.radicado ?? item.radicado;
    item.fechaRadicado = req.body.fechaRadicado ?? item.fechaRadicado;
    item.tipo = req.body.tipo ?? item.tipo;
    item.detalle = req.body.detalle ?? item.detalle;
    item.solicitante = req.body.solicitante ?? item.solicitante;
    item.correo = req.body.correo ?? item.correo;
    item.tipoResolucion = req.body.tipoResolucion ?? item.tipoResolucion;
    item.numeroResolucion = req.body.numeroResolucion ?? item.numeroResolucion;
    item.fechaResolucion = req.body.fechaResolucion ?? item.fechaResolucion;
    item.fechaNotificacion = req.body.fechaNotificacion ?? item.fechaNotificacion;

    if (req.file) {
      item.pdfData = `data:application/pdf;base64,${req.file.buffer.toString('base64')}`;
      item.pdfName = req.file.originalname;
    }

    await item.save();
    const obj = item.toObject();
    delete obj.pdfData;
    res.json(obj);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Solicitud.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'No encontrada' });
    res.json({ message: 'Eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
