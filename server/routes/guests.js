const express = require('express');
const pool = require('../db/pool');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

function validId(value) {
  return /^[1-9]\d*$/.test(String(value));
}

// Consultar invitados de un evento propio.
router.get('/events/:eventId', async (req, res) => {
  const { eventId } = req.params;

  if (!validId(eventId)) {
    return res.status(400).json({ error: 'Identificador de evento inválido.' });
  }

  try {
    const event = await pool.query(
      'SELECT id FROM events WHERE id = $1 AND user_id = $2',
      [eventId, req.user.id]
    );

    if (!event.rowCount) {
      return res.status(404).json({ error: 'No se encontró ese evento.' });
    }

    const result = await pool.query(
      `SELECT id, event_id, name, email, status, created_at
       FROM guests
       WHERE event_id = $1
       ORDER BY created_at DESC, id DESC`,
      [eventId]
    );

    res.json({ guests: result.rows });
  } catch (error) {
    console.error('Error consultando invitados:', error.message);
    res.status(500).json({ error: 'No se pudieron consultar los invitados.' });
  }
});

// Registrar un invitado.
router.post('/events/:eventId', async (req, res) => {
  const { eventId } = req.params;
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim();

  if (!validId(eventId)) {
    return res.status(400).json({ error: 'Identificador de evento inválido.' });
  }

  if (!name || name.length > 120) {
    return res.status(400).json({ error: 'El nombre es obligatorio y debe tener máximo 120 caracteres.' });
  }

  if (email.length > 254 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO guests (event_id, name, email, status)
       SELECT id, $3, $4, 'pendiente'
       FROM events
       WHERE id = $1 AND user_id = $2
       RETURNING id, event_id, name, email, status, created_at`,
      [eventId, req.user.id, name, email || null]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: 'No se encontró ese evento.' });
    }

    await pool.query(
      `INSERT INTO activity_history (user_id, event_id, action, details)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [req.user.id, eventId, 'Agregó un invitado', JSON.stringify({ name, email })]
    );

    res.status(201).json({ guest: result.rows[0] });
  } catch (error) {
    console.error('Error registrando invitado:', error.message);
    res.status(500).json({ error: 'No se pudo registrar el invitado.' });
  }
});

// Cambiar el estado de asistencia.
router.patch('/events/:eventId/:guestId', async (req, res) => {
  const { eventId, guestId } = req.params;
  const status = String(req.body.status || '');

  if (!validId(eventId) || !validId(guestId)) {
    return res.status(400).json({ error: 'Identificador inválido.' });
  }

  if (!['pendiente', 'confirmado', 'rechazado'].includes(status)) {
    return res.status(400).json({ error: 'Estado de asistencia inválido.' });
  }

  try {
    const result = await pool.query(
      `UPDATE guests g
       SET status = $3
       FROM events e
       WHERE g.id = $1
         AND g.event_id = e.id
         AND e.id = $2
         AND e.user_id = $4
       RETURNING g.id, g.event_id, g.name, g.email, g.status, g.created_at`,
      [guestId, eventId, status, req.user.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: 'No se encontró ese invitado.' });
    }

    res.json({ guest: result.rows[0] });
  } catch (error) {
    console.error('Error actualizando invitado:', error.message);
    res.status(500).json({ error: 'No se pudo actualizar el invitado.' });
  }
});

// Eliminar un invitado.
router.delete('/events/:eventId/:guestId', async (req, res) => {
  const { eventId, guestId } = req.params;

  if (!validId(eventId) || !validId(guestId)) {
    return res.status(400).json({ error: 'Identificador inválido.' });
  }

  try {
    const result = await pool.query(
      `DELETE FROM guests g
       USING events e
       WHERE g.id = $1
         AND g.event_id = e.id
         AND e.id = $2
         AND e.user_id = $3
       RETURNING g.id, g.name`,
      [guestId, eventId, req.user.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: 'No se encontró ese invitado.' });
    }

    res.json({ message: 'Invitado eliminado.', id: result.rows[0].id });
  } catch (error) {
    console.error('Error eliminando invitado:', error.message);
    res.status(500).json({ error: 'No se pudo eliminar el invitado.' });
  }
});

module.exports = router;
