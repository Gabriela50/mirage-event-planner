const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    { sub: String(user.id), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

router.post('/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!name || !email || !email.includes('@') || password.length < 8) {
      return res.status(400).json({
        error: 'Ingresa tu nombre, un correo válido y una contraseña de al menos 8 caracteres.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );

    const user = result.rows[0];

    await pool.query(
      `INSERT INTO activity_history (user_id, action)
       VALUES ($1, $2)`,
      [user.id, 'Creó su cuenta']
    );

    res.status(201).json({
      message: 'Cuenta creada correctamente.',
      user,
      token: createToken(user),
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ese correo ya está registrado.' });
    }

    console.error('Error en registro:', error.message);
    res.status(500).json({ error: 'No se pudo crear la cuenta.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const result = await pool.query(
      `SELECT id, name, email, password_hash
       FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    await pool.query(
      `INSERT INTO activity_history (user_id, action)
       VALUES ($1, $2)`,
      [user.id, 'Inició sesión']
    );

    res.json({
      message: 'Inicio de sesión correcto.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token: createToken(user),
    });
  } catch (error) {
    console.error('Error en inicio de sesión:', error.message);
    res.status(500).json({ error: 'No se pudo iniciar sesión.' });
  }
});

module.exports = router;
