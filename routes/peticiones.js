const express = require('express');
const router = express.Router();
const multer = require('multer');
const Peticion = require('../models/Peticion');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Solo se permiten archivos PDF'));
  }
});

// GET todas / búsqueda
router.get('/', async (req, res) => {
  try {
    const q = req.query.q || '';
    let filter = {};
    if (q) {
      const regex = new RegExp(q, 'i');
      filter = {
        $or: [
          { radicado: regex },
          { peticionario: regex },
          { correo: regex },
          { tipo: regex },
          { oficio: regex }
        ]
      };
    }
    // No devolver el pdfData completo en el listado (es pesado)
    const items = await Peticion.find(filter)
      .select('-pdfData')
      .sort({ fechaRadicado: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET una (incluye pdfData)
router.get('/:id', async (req, res) => {
  try {
    const item = await Peticion.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'No encontrada' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear
router.post('/', upload.single('pdf'), async (req, res) => {
  try {
    const data = {
      radicado: req.body.radicado,
      fechaRadicado: req.body.fechaRadicado,
      tipo: req.body.tipo,
      peticionario: req.body.peticionario,
      correo: req.body.correo,
      oficio: req.body.oficio || '',
      fechaRespuesta: req.body.fechaRespuesta || ''
    };

    if (req.file) {
      data.pdfData = `data:application/pdf;base64,${req.file.buffer.toString('base64')}`;
      data.pdfName = req.file.originalname;
    }

    const item = new Peticion(data);
    await item.save();
    // No devolver pdfData completo en la respuesta
    const obj = item.toObject();
    delete obj.pdfData;
    res.status(201).json(obj);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT actualizar
router.put('/:id', upload.single('pdf'), async (req, res) => {
  try {
    const item = await Peticion.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'No encontrada' });

    item.radicado = req.body.radicado ?? item.radicado;
    item.fechaRadicado = req.body.fechaRadicado ?? item.fechaRadicado;
    item.tipo = req.body.tipo ?? item.tipo;
    item.peticionario = req.body.peticionario ?? item.peticionario;
    item.correo = req.body.correo ?? item.correo;
    item.oficio = req.body.oficio ?? item.oficio;
    item.fechaRespuesta = req.body.fechaRespuesta ?? item.fechaRespuesta;

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

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const item = await Peticion.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'No encontrada' });
    res.json({ message: 'Eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
