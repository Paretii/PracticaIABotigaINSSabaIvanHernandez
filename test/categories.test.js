import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp } from '../src/app.js';
import { crearBaseDades } from '../src/db.js';

let servidor;
let base;

before(() => {
  servidor = crearApp(crearBaseDades()).listen(0);
  base = `http://localhost:${servidor.address().port}`;
});

after(() => servidor.close());

test('GET /api/categories retorna cada categoria amb el nombre de productes', async () => {
  const resposta = await fetch(`${base}/api/categories`);
  assert.equal(resposta.status, 200);
  const categories = await resposta.json();
  assert.deepEqual(categories, [
    { categoria: 'casa', numProductes: 2 },
    { categoria: 'papereria', numProductes: 2 },
    { categoria: 'roba', numProductes: 2 },
  ]);
});

test('GET /api/categories compta els productes nous i inclou categories noves', async () => {
  const db = crearBaseDades();
  db.prepare('INSERT INTO productes (nom, descripcio, categoria, preu) VALUES (?, ?, ?, ?)')
    .run('Gorra', 'Gorra de cotó', 'roba', 12);
  db.prepare('INSERT INTO productes (nom, descripcio, categoria, preu) VALUES (?, ?, ?, ?)')
    .run('Adhesiu', 'Adhesiu de vinil', 'regals', 1.5);
  const servidorPropi = crearApp(db).listen(0);
  try {
    const resposta = await fetch(`http://localhost:${servidorPropi.address().port}/api/categories`);
    const categories = await resposta.json();
    assert.equal(categories.find((c) => c.categoria === 'roba').numProductes, 3);
    assert.equal(categories.find((c) => c.categoria === 'regals').numProductes, 1);
  } finally {
    servidorPropi.close();
  }
});

test('GET /api/categories retorna una llista buida si no hi ha productes', async () => {
  const db = crearBaseDades();
  db.exec('DELETE FROM ressenyes; DELETE FROM productes;');
  const servidorPropi = crearApp(db).listen(0);
  try {
    const resposta = await fetch(`http://localhost:${servidorPropi.address().port}/api/categories`);
    assert.equal(resposta.status, 200);
    assert.deepEqual(await resposta.json(), []);
  } finally {
    servidorPropi.close();
  }
});

test('GET /api/categories retorna 500 amb error en JSON si falla la base de dades', async () => {
  const db = crearBaseDades();
  db.close();
  const servidorPropi = crearApp(db).listen(0);
  try {
    const resposta = await fetch(`http://localhost:${servidorPropi.address().port}/api/categories`);
    assert.equal(resposta.status, 500);
    const cos = await resposta.json();
    assert.equal(typeof cos.error, 'string');
  } finally {
    servidorPropi.close();
  }
});
