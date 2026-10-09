const express = require('express');
const pool = require('../db/pool');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

function validId(id) {
  return /^[1-9]\d*$/.test(String(id));
}

// Consultar los gastos de un evento propio.
router.get('/events/:eventId/items', async (req, res) => {
  const { eventId } = req.params;

  if (!validId(eventId)) {
    return res.status(400).json({ error: 'El identificador del evento no es válido.' });
  }

  try {
    const result = await pool.query(
      `SELECT bi.id, bi.event_id, bi.description, bi.amount,
              bi.category, bi.created_at
       FROM budget_items bi
       JOIN events e ON e.id = bi.event_id
       WHERE bi.event_id = $1 AND e.user_id = $2
       ORDER BY bi.created_at DESC`,
      [eventId, req.user.id]
    );

    const event = await pool.query(
      'SELECT id FROM events WHERE id = $1 AND user_id = $2',
      [eventId, req.user.id]
    );

    if (!event.rowCount) {
      return res.status(404).json({ error: 'No se encontró ese evento.' });
    }

    res.json({ items: result.rows });
  } catch (error) {
    console.error('Error consultando gastos:', error.message);
    res.status(500).json({ error: 'No se pudieron consultar los gastos.' });
  }
});

// Registrar un gasto en un evento propio.
router.post('/events/:eventId/items', async (req, res) => {
  const { eventId } = req.params;
  const description = String(req.body.description || '').trim();
  const category = String(req.body.category || 'Otro').trim();
  const amount = Number(req.body.amount);

  if (!validId(eventId)) {
    return res.status(400).json({ error: 'El identificador del evento no es válido.' });
  }

  if (!description || description.length > 180) {
    return res.status(400).json({
      error: 'El concepto es obligatorio y debe tener máximo 180 caracteres.',
    });
  }

  if (!Number.isFinite(amount) || amount < 0 || amount > 9999999999.99) {
    return res.status(400).json({ error: 'El valor del gasto no es válido.' });
  }

  if (!category || category.length > 80) {
    return res.status(400).json({ error: 'La categoría no es válida.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO budget_items (event_id, description, amount, category)
       SELECT e.id, $3, $4, $5
       FROM events e
       WHERE e.id = $1 AND e.user_id = $2
       RETURNING id, event_id, description, amount, category, created_at`,
      [eventId, req.user.id, description, amount, category]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: 'No se encontró ese evento.' });
    }

    await pool.query(
      `INSERT INTO activity_history (user_id, event_id, action, details)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [
        req.user.id,
        eventId,
        'Registró un gasto',
        JSON.stringify({ description, amount, category }),
      ]
    );

    res.status(201).json({ item: result.rows[0] });
  } catch (error) {
    console.error('Error registrando gasto:', error.message);
    res.status(500).json({ error: 'No se pudo registrar el gasto.' });
  }
});

// Eliminar un gasto de un evento propio.
router.delete('/events/:eventId/items/:itemId', async (req, res) => {
  const { eventId, itemId } = req.params;

  if (!validId(eventId) || !validId(itemId)) {
    return res.status(400).json({ error: 'Los identificadores no son válidos.' });
  }

  try {
    const result = await pool.query(
      `DELETE FROM budget_items bi
       USING events e
       WHERE bi.id = $1
         AND bi.event_id = $2
         AND e.id = bi.event_id
         AND e.user_id = $3
       RETURNING bi.id, bi.description`,
      [itemId, eventId, req.user.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: 'No se encontró ese gasto.' });
    }

    await pool.query(
      `INSERT INTO activity_history (user_id, event_id, action, details)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [
        req.user.id,
        eventId,
        'Eliminó un gasto',
        JSON.stringify({ description: result.rows[0].description }),
      ]
    );

    res.json({ message: 'Gasto eliminado correctamente.' });
  } catch (error) {
    console.error('Error eliminando gasto:', error.message);
    res.status(500).json({ error: 'No se pudo eliminar el gasto.' });
  }
});

module.exports = router;
