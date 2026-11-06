import { Router } from 'express';

const MAX_AUTOR = 50;
const MAX_TEXT = 1000;

/**
 * Valida el cos d'una ressenya nova, sense consultar la base de dades.
 * @param {{producteId: unknown, autor: unknown, text: unknown, puntuacio: unknown}} ressenya
 *   Camps rebuts al cos de la petició.
 * @returns {string|null} Missatge d'error, o `null` si els camps són vàlids.
 */
function validarRessenya({ producteId, autor, text, puntuacio }) {
  if (!Number.isInteger(producteId) || producteId <= 0) {
    return 'El producte ha de ser un enter positiu';
  }
  if (typeof autor !== 'string' || autor.trim() === '') {
    return "L'autor no pot estar buit";
  }
  if (autor.trim().length > MAX_AUTOR) {
    return `L'autor no pot superar els ${MAX_AUTOR} caràcters`;
  }
  if (typeof text !== 'string' || text.trim() === '') {
    return 'El text no pot estar buit';
  }
  if (text.trim().length > MAX_TEXT) {
    return `El text no pot superar els ${MAX_TEXT} caràcters`;
  }
  if (!Number.isInteger(puntuacio) || puntuacio < 1 || puntuacio > 5) {
    return 'La puntuació ha de ser un enter entre 1 i 5';
  }
  return null;
}

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
   * Crea una ressenya d'un producte. Desa `autor` i `text` sense els espais
   * dels extrems.
   *
   * - Mètode: POST
   * - Ruta: /api/ressenyes
   * - Paràmetres (cos JSON, tots obligatoris):
   *   - `producteId` {number}: enter positiu, identificador d'un producte existent.
   *   - `autor` {string}: nom de l'autor, no buit i de 50 caràcters com a màxim.
   *   - `text` {string}: text de la ressenya, no buit i de 1000 caràcters com a màxim.
   *   - `puntuacio` {number}: enter entre 1 i 5.
   * - Codis d'error:
   *   - 400: `{ error }` si algun camp no és vàlid o el producte no existeix.
   *     No es desa res.
   *   - 400: el cos no és JSON vàlid. Respon el gestor per defecte d'Express, en
   *     HTML i no en format `{ error }`.
   *
   * @param {import('express').Request} req Petició; llegeix `req.body`.
   * @param {import('express').Response} res Resposta.
   * @returns {void} Respon 201 amb `{ id }`, l'identificador de la ressenya creada.
   */
  router.post('/', (req, res) => {
    const { producteId, autor, text, puntuacio } = req.body;
    const error = validarRessenya({ producteId, autor, text, puntuacio });
    if (error) {
      return res.status(400).json({ error });
    }
    const producte = db.prepare('SELECT id FROM productes WHERE id = ?').get(producteId);
    if (!producte) {
      return res.status(400).json({ error: 'El producte no existeix' });
    }
    const resultat = db
      .prepare(
        'INSERT INTO ressenyes (producte_id, autor, text, puntuacio) VALUES (?, ?, ?, ?)'
      )
      .run(producteId, autor.trim(), text.trim(), puntuacio);
    res.status(201).json({ id: Number(resultat.lastInsertRowid) });
  });

  return router;
}
