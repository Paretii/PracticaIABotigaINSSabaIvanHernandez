import { DatabaseSync } from 'node:sqlite';

/**
 * Crea la base de dades en memòria i hi carrega dades de prova.
 * Cada vegada que s'inicia el servidor, les dades tornen a l'estat inicial.
 */
export function crearBaseDades() {
  const db = new DatabaseSync(':memory:');

  db.exec(`
    CREATE TABLE productes (
      id INTEGER PRIMARY KEY,
      nom TEXT NOT NULL,
      descripcio TEXT,
      categoria TEXT NOT NULL,
      preu REAL NOT NULL
    );

    CREATE TABLE ressenyes (
      id INTEGER PRIMARY KEY,
      producte_id INTEGER NOT NULL REFERENCES productes(id),
      autor TEXT NOT NULL,
      text TEXT NOT NULL,
      puntuacio INTEGER NOT NULL
    );

    CREATE TABLE usuaris (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      contrasenya TEXT NOT NULL,
      rol TEXT NOT NULL DEFAULT 'client'
    );
  `);

  const insereixProducte = db.prepare(
    'INSERT INTO productes (nom, descripcio, categoria, preu) VALUES (?, ?, ?, ?)'
  );
  [
    ['Samarreta Vallès', 'Samarreta de cotó orgànic', 'roba', 19.95],
    ['Dessuadora DAW', 'Dessuadora amb caputxa', 'roba', 34.5],
    ['Tassa Copilot', 'Tassa de ceràmica de 350 ml', 'casa', 9.9],
    ['Llibreta punts', 'Llibreta A5 de punts', 'papereria', 6.75],
    ['Bolígraf metàl·lic', 'Bolígraf recarregable', 'papereria', 3.2],
    ['Coixí codi', 'Coixí estampat amb codi font', 'casa', 15],
  ].forEach((p) => insereixProducte.run(...p));

  const insereixRessenya = db.prepare(
    'INSERT INTO ressenyes (producte_id, autor, text, puntuacio) VALUES (?, ?, ?, ?)'
  );
  insereixRessenya.run(1, 'Marta', 'Molt còmoda i de bona qualitat.', 5);
  insereixRessenya.run(1, 'Jordi', 'La talla és una mica petita.', 3);
  insereixRessenya.run(3, 'Laia', 'Perfecta per al cafè del matí.', 4);

  const insereixUsuari = db.prepare(
    'INSERT INTO usuaris (email, contrasenya, rol) VALUES (?, ?, ?)'
  );
  insereixUsuari.run('admin@botiga.example.com', 'Admin2026!', 'admin');
  insereixUsuari.run('client@botiga.example.com', 'client123', 'client');

  return db;
}
