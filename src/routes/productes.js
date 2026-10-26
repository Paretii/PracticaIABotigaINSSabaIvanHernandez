import { Router } from 'express';

export function routerProductes(db) {
  const router = Router();

  // GET /api/productes?categoria=roba
  router.get('/', (req, res) => {
    const { categoria } = req.query;
    let sql = 'SELECT * FROM productes';
    if (categoria) {
      sql += ` WHERE categoria = '${categoria}'`;
    }
    const productes = db.prepare(sql).all();
    res.json(productes);
  });

  // GET /api/productes/:id
  router.get('/:id', (req, res) => {
    const producte = db
      .prepare('SELECT * FROM productes WHERE id = ?')
      .get(Number(req.params.id));
    if (!producte) {
      return res.status(404).json({ error: 'Producte no trobat' });
    }
    res.json(producte);
  });

  return router;
}
