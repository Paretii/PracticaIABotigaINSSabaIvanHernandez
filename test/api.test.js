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

test('GET /api/productes retorna tots els productes', async () => {
  const resposta = await fetch(`${base}/api/productes`);
  assert.equal(resposta.status, 200);
  const productes = await resposta.json();
  assert.equal(productes.length, 6);
});

test('GET /api/productes?categoria=roba filtra per categoria', async () => {
  const resposta = await fetch(`${base}/api/productes?categoria=roba`);
  const productes = await resposta.json();
  assert.ok(productes.every((p) => p.categoria === 'roba'));
});

test('GET /api/productes/:id retorna 404 si no existeix', async () => {
  const resposta = await fetch(`${base}/api/productes/999`);
  assert.equal(resposta.status, 404);
});

test('GET /api/productes inclou la mitjana i el nombre de ressenyes', async () => {
  const resposta = await fetch(`${base}/api/productes`);
  const productes = await resposta.json();
  const producte = productes.find((p) => p.id === 1);
  assert.equal(producte.mitjana, 4);
  assert.equal(producte.numRessenyes, 2);
});

test('GET /api/productes retorna mitjana null i 0 ressenyes si no en té', async () => {
  const resposta = await fetch(`${base}/api/productes`);
  const productes = await resposta.json();
  const producte = productes.find((p) => p.id === 2);
  assert.equal(producte.mitjana, null);
  assert.equal(producte.numRessenyes, 0);
});

test('GET /api/productes arrodoneix la mitjana a 1 decimal', async () => {
  const servidorPropi = crearApp(crearBaseDades()).listen(0);
  const basePropia = `http://localhost:${servidorPropi.address().port}`;
  try {
    for (const puntuacio of [5, 4, 4]) {
      await fetch(`${basePropia}/api/ressenyes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ producteId: 4, autor: 'Test', text: 'Prova', puntuacio }),
      });
    }
    const resposta = await fetch(`${basePropia}/api/productes`);
    const productes = await resposta.json();
    const producte = productes.find((p) => p.id === 4);
    assert.equal(producte.mitjana, 4.3);
    assert.equal(producte.numRessenyes, 3);
  } finally {
    servidorPropi.close();
  }
});
