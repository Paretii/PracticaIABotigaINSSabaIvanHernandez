import { Router } from 'express';
import { calcularResum } from '../utils/carret.js';

/**
 * Crea el router del carret, muntat a `/api/carret`.
 * @returns {import('express').Router} Router amb els endpoints del carret.
 */
export function routerCarret() {
  const router = Router();

  // POST /api/carret/total  { items: [{ preu, quantitat, pes? }], descompte }
  /**
   * Calcula el resum del carret: subtotal amb descompte, enviament i total.
   * No valida `preu` ni `quantitat`: si no són numèrics, respon 200 amb valors `null`.
   *
   * - Mètode: POST
   * - Ruta: /api/carret/total
   * - Paràmetres (cos JSON):
   *   - `items` {Array<{preu: number, quantitat: number, pes?: number}>}: opcional,
   *     per defecte `[]`.
   *   - `descompte` {number}: percentatge entre 0 i 100; opcional, per defecte 0.
   * - Codis d'error:
   *   - 400: `{ error }` amb el missatge de l'excepció si `descompte` és fora de
   *     rang, algun `pes` no és vàlid, `items` no és un array o conté `null`.
   *   - 400: el cos no és JSON vàlid. Respon el gestor per defecte d'Express, en
   *     HTML i no en format `{ error }`.
   *
   * @param {import('express').Request} req Petició; llegeix `req.body`.
   * @param {import('express').Response} res Resposta.
   * @returns {void} Respon 200 amb `{ subtotal, enviament, total }`.
   */
  router.post('/total', (req, res) => {
    const { items = [], descompte = 0 } = req.body;
    try {
      res.json(calcularResum(items, descompte));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
