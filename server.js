require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const peticionesRoutes = require('./routes/peticiones');
const solicitudesRoutes = require('./routes/solicitudes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir frontend
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/api/peticiones', peticionesRoutes);
app.use('/api/solicitudes', solicitudesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Frontend fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Conexión MongoDB
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Falta MONGO_URI en variables de entorno');
}

// Cache de conexión para serverless (Vercel)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Para desarrollo local
if (require.main === module) {
  connectDB()
    .then(() => {
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`Servidor local en http://localhost:${PORT}`);
        console.log('MongoDB conectado');
      });
    })
    .catch((err) => {
      console.error('Error MongoDB:', err.message);
      process.exit(1);
    });
}

// Exportar para Vercel
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
