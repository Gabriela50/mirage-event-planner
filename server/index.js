require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db/pool');

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/guests', require('./routes/guests'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/assistant', require('./routes/assistant'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'MIRAGE API' });
});

app.get('/api/db-check', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        current_database() AS database,
        current_user AS username,
        (
          SELECT COUNT(*)
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
        ) AS tables
    `);

    res.json({ status: 'connected', ...result.rows[0] });
  } catch (error) {
    console.error('Error consultando PostgreSQL:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'No se pudo consultar la base de datos.',
    });
  }
});

app.use(express.static(path.join(__dirname, "../dist")));
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api")) return next();
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const port = Number(process.env.PORT || 3001);

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`MIRAGE API disponible en http://localhost:${port}`);
});

async function shutdown() {
  server.close();
  await pool.end();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
