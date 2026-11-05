import { Router } from 'express';

/**
 * Crea el router de les categories, muntat a `/api/categories`.
 * @param {import('node:sqlite').DatabaseSync} db Base de dades de la botiga.
 * @returns {import('express').Router} Router amb els endpoints de categories.
 */
export function routerCategories(db) {
  const router = Router();

  // GET /api/categories
  /**
   * Llista les categories, ordenades alfabèticament, amb el nombre de productes.
   *
   * - Mètode: GET
   * - Ruta: /api/categories
   * - Paràmetres: cap.
   * - Codis d'error:
   *   - 500: `{ error: 'No s\'han pogut obtenir les categories' }` si la consulta falla.
   *
   * @param {import('express').Request} req Petició; no en llegeix cap dada.
   * @param {import('express').Response} res Resposta.
   * @returns {void} Respon 200 amb un array de `{ categoria, numProductes }`.
   */
  router.get('/', (req, res) => {
    try {
      const categories = db
        .prepare(
          `SELECT categoria, COUNT(*) AS numProductes
           FROM productes
           GROUP BY categoria
           ORDER BY categoria`
        )
        .all();
      res.json(categories);
    } catch {
      res.status(500).json({ error: 'No s\'han pogut obtenir les categories' });
    }
  });

  return router;
}
