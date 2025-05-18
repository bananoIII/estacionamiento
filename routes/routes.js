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
router.post('/api/update', async (req, res) => {
    const { uni, camp, sec } = req.params;
    const { lugares } = req.body;
  
    if (!Array.isArray(lugares) || lugares.length === 0) {
      return res.status(400).json({ error: 'Se requiere una lista de lugares.' });
    }
  
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
  
      // Buscar el ID de la sección correspondiente
     
  
      for (const lugar of lugares) {
          await client.query(
            'UPDATE lugares SET ocupado = $1 WHERE id = $2',
            [lugar.ocupado, lugar.id]
          );
        
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