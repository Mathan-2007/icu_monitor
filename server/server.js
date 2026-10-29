require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const initSocket = require('./sockets');
const { startSimulator } = require('./services/simulator');

const app = express();
app.set('trust proxy', 1);

const { apiLimiter } = require('./middleware/rateLimiter');
app.use('/api', apiLimiter);

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

const isDbReady = () => mongoose.connection.readyState === 1;

app.get('/api/health', (req, res) => {
  const ready = isDbReady();
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ok' : 'degraded',
    ready,
    time: new Date().toISOString(),
    dbConnected: ready,
    database: mongoose.connection.name || null,
    host: mongoose.connection.host || null
  });
});

app.get('/api/ready', (req, res) => {
  if (!isDbReady()) {
    return res.status(503).json({
      status: 'not-ready',
      ready: false,
      message: 'Database connection not available yet.'
    });
  }

  res.json({ status: 'ready', ready: true });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/vitals', require('./routes/vitalRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/beds', require('./routes/bedRoutes'));
app.use('/api/handovers', require('./routes/handoverRoutes'));

// 404 + error handler (last)
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use(require('./middleware/errorHandler'));

const server = http.createServer(app);
const { runEscalationSweep } = require('./services/escalationService');
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    if (process.env.SIMULATOR_ENABLED === 'true') {
      startSimulator();
      runEscalationSweep();
    }
  });
};

initSocket(server);

const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    mongoose.disconnect().finally(() => process.exit(0));
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

module.exports = app;