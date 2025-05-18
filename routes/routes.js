const express = require('express')
const pool = require('../lib/database')
const router = express.Router()

router.get('/api/get_all', async (req, res) => {
    try {
      const query = `
        SELECT 
          lugares.id,
          lugares.numero,
          lugares.ocupado,
          lugares.tipo,
          secciones.nombre AS seccion,
          campus.nombre AS campus,
          universidades.nombre AS universidad
        FROM lugares
        JOIN secciones ON lugares.seccion_id = secciones.id
        JOIN campus ON secciones.campus_id = campus.id
        JOIN universidades ON campus.universidad_id = universidades.id
        ORDER BY universidad, campus, seccion, lugares.numero;
      `;
  
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error('Error al obtener los lugares:', err);
      res.status(500).json({ error: 'Error al obtener los lugares' });
    }
  });


  // archivo: routes/lugares.js (agrega esto al final del archivo)
router.put('/universidad/:uni/campus/:camp/seccion/:sec', async (req, res) => {
    const { uni, camp, sec } = req.params;
    const { lugares } = req.body;
  
    if (!Array.isArray(lugares) || lugares.length === 0) {
      return res.status(400).json({ error: 'Se requiere una lista de lugares.' });
    }
  
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
  
      // Buscar el ID de la sección correspondiente
      const secQuery = `
        SELECT lugares.id, lugares.numero
        FROM lugares
        JOIN secciones ON lugares.seccion_id = secciones.id
        JOIN campus ON secciones.campus_id = campus.id
        JOIN universidades ON campus.universidad_id = universidades.id
        WHERE universidades.nombre = $1 AND campus.nombre = $2 AND secciones.nombre = $3
      `;
  
      const { rows: existentes } = await client.query(secQuery, [uni, camp, sec]);
  
      const lugaresMap = new Map(existentes.map(l => [l.numero, l.id]));
  
      for (const lugar of lugares) {
        const lugarId = lugaresMap.get(lugar.numero);
        if (lugarId) {
          await client.query(
            'UPDATE lugares SET ocupado = $1 WHERE id = $2',
            [lugar.ocupado, lugarId]
          );
        }
      }
  
      await client.query('COMMIT');
      res.json({ mensaje: 'Lugares actualizados correctamente' });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error al actualizar lugares:', err);
      res.status(500).json({ error: 'Error al actualizar los lugares' });
    } finally {
      client.release();
    }
  });
  
module.exports = router;