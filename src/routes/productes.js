import { Router } from 'express';

/**
 * Crea el router dels productes, muntat a `/api/productes`.
 * @param {import('node:sqlite').DatabaseSync} db Base de dades de la botiga.
 * @returns {import('express').Router} Router amb els endpoints de productes.
 */
export function routerProductes(db) {
  const router = Router();

  // GET /api/productes?categoria=roba
  /**
   * Llista els productes amb la seva puntuació mitjana i el nombre de ressenyes.
   *
   * - Mètode: GET
   * - Ruta: /api/productes
   * - Paràmetres: `categoria` (query, opcional) filtra per categoria exacta.
   * - Codis d'error:
   *   - 500: la consulta SQL falla, per exemple si `categoria` conté una cometa
   *     simple. No és gestionat per la ruta: respon el gestor per defecte
   *     d'Express, en HTML i no en format `{ error }`.
   *
   * @param {import('express').Request} req Petició; llegeix `req.query.categoria`.
   * @param {import('express').Response} res Resposta.
   * @returns {void} Respon 200 amb un array de productes (buit si no n'hi ha cap)
   *   amb `mitjana` (`null` si no té ressenyes) i `numRessenyes`.
   */
  router.get('/', (req, res) => {
    const { categoria } = req.query;
    let sql = `SELECT p.*,
                      ROUND(AVG(r.puntuacio), 1) AS mitjana,
                      COUNT(r.id) AS numRessenyes
               FROM productes p
               LEFT JOIN ressenyes r ON r.producte_id = p.id`;
    if (categoria) {
      sql += ` WHERE categoria = '${categoria}'`;
    }
    sql += ' GROUP BY p.id';
    const productes = db.prepare(sql).all();
    res.json(productes);
  });

  // GET /api/productes/:id
  /**
   * Retorna un producte pel seu identificador.
   *
   * - Mètode: GET
   * - Ruta: /api/productes/:id
   * - Paràmetres: `id` (ruta, obligatori) identificador numèric del producte.
   * - Codis d'error:
   *   - 404: `{ error: 'Producte no trobat' }` si no existeix cap producte amb
   *     aquest `id`; també si `id` no és numèric.
   *
   * @param {import('express').Request} req Petició; llegeix `req.params.id`.
   * @param {import('express').Response} res Resposta.
   * @returns {void} Respon 200 amb el producte, sense `mitjana` ni `numRessenyes`.
   */
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
