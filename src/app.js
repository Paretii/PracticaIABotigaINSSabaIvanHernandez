import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { routerProductes } from './routes/productes.js';
import { routerRessenyes } from './routes/ressenyes.js';
import { routerCarret } from './routes/carret.js';

const directori = path.dirname(fileURLToPath(import.meta.url));

/**
 * Crea l'aplicació Express amb totes les rutes.
 * @param {import('node:sqlite').DatabaseSync} db
 */
export function crearApp(db) {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(directori, '..', 'public')));

  app.use('/api/productes', routerProductes(db));
  app.use('/api/ressenyes', routerRessenyes(db));
  app.use('/api/carret', routerCarret());

  return app;
}
