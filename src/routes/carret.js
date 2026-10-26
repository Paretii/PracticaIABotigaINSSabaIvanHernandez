import { Router } from 'express';
import { calcularTotal } from '../utils/carret.js';

export function routerCarret() {
  const router = Router();

  // POST /api/carret/total  { items: [{ preu, quantitat }], descompte }
  router.post('/total', (req, res) => {
    const { items = [], descompte = 0 } = req.body;
    try {
      res.json({ total: calcularTotal(items, descompte) });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
