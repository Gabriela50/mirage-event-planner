const express = require('express');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.post('/recommendation', authenticate, async (req, res) => {
  const prompt =
    typeof req.body.prompt === 'string'
      ? req.body.prompt.trim()
      : '';

  const language = req.body.language === 'en' ? 'en' : 'es';

  if (!prompt) {
    return res.status(400).json({
      error:
        language === 'en'
          ? 'Write what kind of event you want to organize.'
          : 'Escribe qué tipo de evento quieres organizar.',
    });
  }

  if (prompt.length > 2000) {
    return res.status(400).json({
      error:
        language === 'en'
          ? 'Your request must be 2000 characters or fewer.'
          : 'Tu petición debe tener máximo 2000 caracteres.',
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error:
        language === 'en'
          ? 'The AI service is not configured on the server.'
          : 'La IA todavía no está configurada en el servidor.',
    });
  }

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text:
                  language === 'en'
                    ? 'You are MIRAGE, a creative event planning assistant. Give practical and complete suggestions about event planning, activities, schedules and budgets. Respect the user budget and currency. Label estimated prices. Use clear headings and lists. Be detailed but concise, finish all sections, and never end in the middle of a sentence or table. Reply in English.'
                    : 'Eres MIRAGE, un asistente creativo para organizar eventos. Da sugerencias prácticas y completas sobre planificación, actividades, cronogramas y presupuestos. Respeta el presupuesto y la moneda del usuario. Indica qué precios son estimados. Usa títulos y listas claras. Sé detallado, pero conciso; termina todas las secciones y no cortes frases ni tablas. Responde en español.',
              },
            ],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        'Gemini API error:',
        response.status,
        data.error?.message || 'Unknown error'
      );

      if (response.status === 429) {
        return res.status(429).json({
          error:
            language === 'en'
              ? 'The free usage limit may have been reached. Please try again later.'
              : 'Es posible que se haya alcanzado el límite gratuito. Inténtalo más tarde.',
        });
      }

      return res.status(502).json({
        error:
          language === 'en'
            ? 'Gemini could not generate a response. Check the API key and model access.'
            : 'Gemini no pudo generar una respuesta. Revisa la clave y el acceso al modelo.',
      });
    }

    const candidate = data.candidates?.[0];

    const recommendation = candidate?.content?.parts
      ?.map((part) => part.text || '')
      .join('')
      .trim();

    if (!recommendation) {
      console.error(
        'Gemini returned no text. Finish reason:',
        candidate?.finishReason || 'Unknown'
      );

      return res.status(502).json({
        error:
          language === 'en'
            ? 'Gemini returned an empty response. Please try again.'
            : 'Gemini devolvió una respuesta vacía. Inténtalo de nuevo.',
      });
    }

    if (candidate?.finishReason === 'MAX_TOKENS') {
      console.warn(
        'MIRAGE response reached the token limit and may be incomplete.'
      );
    }

    return res.json({ recommendation });
  } catch (error) {
    console.error('MIRAGE assistant error:', error.message);

    return res.status(502).json({
      error:
        language === 'en'
          ? 'Could not connect to the AI service. Check your internet connection.'
          : 'No se pudo conectar con la IA. Revisa tu conexión a internet.',
    });
  }
});

module.exports = router;