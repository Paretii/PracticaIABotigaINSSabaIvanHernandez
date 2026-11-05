import { Router } from 'express';

/**
 * Crea el router de les ressenyes, muntat a `/api/ressenyes`.
 * @param {import('node:sqlite').DatabaseSync} db Base de dades de la botiga.
 * @returns {import('express').Router} Router amb els endpoints de ressenyes.
 */
export function routerRessenyes(db) {
  const router = Router();

  // GET /api/ressenyes?producteId=1
  /**
   * Llista les ressenyes d'un producte, de la més recent a la més antiga.
   *
   * - Mètode: GET
   * - Ruta: /api/ressenyes
   * - Paràmetres: `producteId` (query) identificador numèric del producte.
   * - Codis d'error: cap. Si `producteId` falta o no és numèric, respon 200 amb
   *   un array buit.
   *
   * @param {import('express').Request} req Petició; llegeix `req.query.producteId`.
   * @param {import('express').Response} res Resposta.
   * @returns {void} Respon 200 amb un array de ressenyes.
   */
  router.get('/', (req, res) => {
    const ressenyes = db
      .prepare('SELECT * FROM ressenyes WHERE producte_id = ? ORDER BY id DESC')
      .all(Number(req.query.producteId));
    res.json(ressenyes);
  });

  // POST /api/ressenyes
  /**
   * Crea una ressenya d'un producte. No valida el rang de `puntuacio`.
   *
   * - Mètode: POST
   * - Ruta: /api/ressenyes
   * - Paràmetres (cos JSON, tots obligatoris):
   *   - `producteId` {number}: identificador d'un producte existent.
   *   - `autor` {string}: nom de l'autor.
   *   - `text` {string}: text de la ressenya.
   *   - `puntuacio` {number}: puntuació de la ressenya.
   * - Codis d'error (cap no és gestionat per la ruta: responen el gestor per
   *   defecte d'Express, en HTML i no en format `{ error }`):
   *   - 400: el cos no és JSON vàlid.
   *   - 500: falta algun camp o és `null`, o `producteId` no existeix.
   *
   * @param {import('express').Request} req Petició; llegeix `req.body`.
   * @param {import('express').Response} res Resposta.
   * @returns {void} Respon 201 amb `{ id }`, l'identificador de la ressenya creada.
   */
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
