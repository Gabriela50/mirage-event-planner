const express = require('express');
const pool = require('../db/pool');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Consultar solo los eventos del usuario autenticado.
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, event_type, event_date,
              location, budget, created_at, updated_at
       FROM events
       WHERE user_id = $1
       ORDER BY event_date ASC NULLS LAST, created_at DESC`,
      [req.user.id]
    );

    res.json({ events: result.rows });
  } catch (error) {
    console.error('Error consultando eventos:', error.message);
    res.status(500).json({ error: 'No se pudieron consultar los eventos.' });
  }
});

// Crear un evento asociado al usuario autenticado.
router.post('/', async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const description = String(req.body.description || '');
    const eventType = String(req.body.event_type || 'Otro');
    const location = String(req.body.location || '');
    const eventDate = req.body.event_date || null;
    const budget = Number(req.body.budget ?? 0);

    if (!title || title.length > 160) {
      return res.status(400).json({
        error: 'El título es obligatorio y debe tener máximo 160 caracteres.',
      });
    }

    if (!Number.isFinite(budget) || budget < 0) {
      return res.status(400).json({
        error: 'El presupuesto debe ser un número mayor o igual a cero.',
      });
    }

    const result = await pool.query(
      `INSERT INTO events
         (user_id, title, description, event_type, event_date, location, budget)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, description, event_type, event_date,
                 location, budget, created_at, updated_at`,
      [
        req.user.id,
        title,
        description,
        eventType,
        eventDate,
        location,
        budget,
      ]
    );

    const event = result.rows[0];

    await pool.query(
      `INSERT INTO activity_history (user_id, event_id, action, details)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [
        req.user.id,
        event.id,
        'Creó un evento',
        JSON.stringify({ title: event.title }),
      ]
    );

    res.status(201).json({ event });
  } catch (error) {
    console.error('Error creando evento:', error.message);
    res.status(500).json({
      error: 'No se pudo crear el evento. Revisa la fecha y los datos enviados.',
    });
  }
});

// Actualizar un evento propio.
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const title = String(req.body.title || '').trim();
    const budget = Number(req.body.budget ?? 0);

    if (!/^[1-9]\d*$/.test(id) || !title || title.length > 160 ||
        !Number.isFinite(budget) || budget < 0) {
      return res.status(400).json({ error: 'Los datos del evento no son válidos.' });
    }

    const result = await pool.query(
      `UPDATE events
       SET title = $1,
           description = $2,
           event_type = $3,
           event_date = $4,
           location = $5,
           budget = $6,
           updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING id, title, description, event_type, event_date,
                 location, budget, created_at, updated_at`,
      [
        title,
        String(req.body.description || ''),
        String(req.body.event_type || 'Otro'),
        req.body.event_date || null,
        String(req.body.location || ''),
        budget,
        id,
        req.user.id,
      ]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: 'No se encontró ese evento.' });
    }

    await pool.query(
      `INSERT INTO activity_history (user_id, event_id, action)
       VALUES ($1, $2, $3)`,
      [req.user.id, id, 'Actualizó un evento']
    );

    res.json({ event: result.rows[0] });
  } catch (error) {
    console.error('Error actualizando evento:', error.message);
    res.status(500).json({ error: 'No se pudo actualizar el evento.' });
  }
});

// Eliminar solo un evento propio.
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({ error: 'El identificador no es válido.' });
    }

    const result = await pool.query(
      `DELETE FROM events
       WHERE id = $1 AND user_id = $2
       RETURNING id, title`,
      [id, req.user.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: 'No se encontró ese evento.' });
    }

    await pool.query(
      `INSERT INTO activity_history (user_id, action, details)
       VALUES ($1, $2, $3::jsonb)`,
      [
        req.user.id,
        'Eliminó un evento',
        JSON.stringify({ title: result.rows[0].title }),
      ]
    );

    res.json({ message: 'Evento eliminado correctamente.' });
  } catch (error) {
    console.error('Error eliminando evento:', error.message);
    res.status(500).json({ error: 'No se pudo eliminar el evento.' });
  }
});

module.exports = router;
