import { Router } from 'express';

export function routerRessenyes(db) {
  const router = Router();

  // GET /api/ressenyes?producteId=1
  router.get('/', (req, res) => {
    const ressenyes = db
      .prepare('SELECT * FROM ressenyes WHERE producte_id = ? ORDER BY id DESC')
      .all(Number(req.query.producteId));
    res.json(ressenyes);
  });

  // POST /api/ressenyes
  router.post('/', (req, res) => {
    const { producteId, autor, text, puntuacio } = req.body;
    const resultat = db
      .prepare(
        'INSERT INTO ressenyes (producte_id, autor, text, puntuacio) VALUES (?, ?, ?, ?)'
      )
      .run(producteId, autor, text, puntuacio);
    res.status(201).json({ id: Number(resultat.lastInsertRowid) });
  });

  return router;
}
