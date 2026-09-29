const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDb } = require('./database/db');
const authRoutes = require('./routes/auth');
const paperRoutes = require('./routes/papers');
const seed = require('./database/seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Research Paper Manager Backend', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/papers', paperRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
async function startServer() {
  try {
    await initDb();
    // Auto-seed if database is fresh
    await seed();

    app.listen(PORT, () => {
      console.log(`Server is running smoothly on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
