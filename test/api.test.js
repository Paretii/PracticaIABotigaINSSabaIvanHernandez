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

test('GET /api/productes?categoria no permet injecció SQL', async () => {
  const injeccio = "' UNION SELECT id, email, contrasenya, rol, 0, 0, 0 FROM usuaris--";
  const resposta = await fetch(`${base}/api/productes?categoria=${encodeURIComponent(injeccio)}`);
  assert.equal(resposta.status, 200);
  assert.deepEqual(await resposta.json(), []);
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

async function demanarTotalCarret(cos) {
  return fetch(`${base}/api/carret/total`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cos),
  });
}

test('POST /api/carret/total retorna subtotal, enviament i total', async () => {
  const resposta = await demanarTotalCarret({ items: [{ preu: 15, quantitat: 3 }] });
  assert.equal(resposta.status, 200);
  assert.deepEqual(await resposta.json(), { subtotal: 45, enviament: 5.9, total: 50.9 });
});

test('POST /api/carret/total fa servir el pes dels items', async () => {
  const resposta = await demanarTotalCarret({ items: [{ preu: 10, quantitat: 1, pes: 6 }] });
  assert.deepEqual(await resposta.json(), { subtotal: 10, enviament: 9.9, total: 19.9 });
});

test('POST /api/carret/total aplica l\'enviament gratuït després del descompte', async () => {
  const items = [{ preu: 60, quantitat: 1 }];
  const senseDescompte = await demanarTotalCarret({ items });
  assert.equal((await senseDescompte.json()).enviament, 0);
  const ambDescompte = await demanarTotalCarret({ items, descompte: 20 });
  assert.equal((await ambDescompte.json()).enviament, 3.9);
});

test('POST /api/carret/total retorna 400 si el descompte no és vàlid', async () => {
  const resposta = await demanarTotalCarret({ items: [], descompte: 120 });
  assert.equal(resposta.status, 400);
  assert.deepEqual(await resposta.json(), { error: 'El descompte ha de ser entre 0 i 100' });
});

test('POST /api/carret/total retorna 400 si el pes no és vàlid', async () => {
  const resposta = await demanarTotalCarret({ items: [{ preu: 10, quantitat: 1, pes: -2 }] });
  assert.equal(resposta.status, 400);
  assert.deepEqual(await resposta.json(), { error: 'El pes ha de ser un nombre positiu' });
});

const ressenyaValida = { producteId: 5, autor: 'Anna', text: 'Escriu molt bé.', puntuacio: 4 };

async function crearRessenya(cos) {
  return fetch(`${base}/api/ressenyes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cos),
  });
}

async function comptarRessenyes(producteId) {
  const resposta = await fetch(`${base}/api/ressenyes?producteId=${producteId}`);
  return (await resposta.json()).length;
}

async function comprovarRebutjada(cos, missatge) {
  const producteId = cos.producteId;
  const abans = await comptarRessenyes(producteId);
  const resposta = await crearRessenya(cos);
  assert.equal(resposta.status, 400);
  assert.deepEqual(await resposta.json(), { error: missatge });
  assert.equal(await comptarRessenyes(producteId), abans);
}

test('POST /api/ressenyes desa una ressenya vàlida', async () => {
  const resposta = await crearRessenya({ ...ressenyaValida, autor: '  Anna  ', text: ' Bona. ' });
  assert.equal(resposta.status, 201);
  const { id } = await resposta.json();
  const llista = await fetch(`${base}/api/ressenyes?producteId=${ressenyaValida.producteId}`);
  const ressenya = (await llista.json()).find((r) => r.id === id);
  assert.equal(ressenya.autor, 'Anna');
  assert.equal(ressenya.text, 'Bona.');
  assert.equal(ressenya.puntuacio, 4);
});

test('POST /api/ressenyes rebutja una puntuació de 99', async () => {
  await comprovarRebutjada(
    { ...ressenyaValida, puntuacio: 99 },
    'La puntuació ha de ser un enter entre 1 i 5'
  );
});

test('POST /api/ressenyes rebutja una puntuació de 0', async () => {
  await comprovarRebutjada(
    { ...ressenyaValida, puntuacio: 0 },
    'La puntuació ha de ser un enter entre 1 i 5'
  );
});

test('POST /api/ressenyes rebutja un autor buit', async () => {
  await comprovarRebutjada({ ...ressenyaValida, autor: '   ' }, "L'autor no pot estar buit");
});

test('POST /api/ressenyes rebutja un text buit', async () => {
  await comprovarRebutjada({ ...ressenyaValida, text: '   ' }, 'El text no pot estar buit');
});

test('POST /api/ressenyes rebutja un producte inexistent', async () => {
  await comprovarRebutjada({ ...ressenyaValida, producteId: 999 }, 'El producte no existeix');
});
