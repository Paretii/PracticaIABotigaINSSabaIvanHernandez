import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calcularEnviament,
  calcularPesTotal,
  calcularResum,
  calcularTotal,
} from '../src/utils/carret.js';

test('calcula el total sense descompte', () => {
  const items = [
    { preu: 10, quantitat: 2 },
    { preu: 5.5, quantitat: 1 },
  ];
  assert.equal(calcularTotal(items), 25.5);
});

test('aplica un descompte percentual', () => {
  const items = [{ preu: 20, quantitat: 2 }];
  assert.equal(calcularTotal(items, 25), 30);
});

test('un carret buit val 0', () => {
  assert.equal(calcularTotal([]), 0);
});

test('llança un error si el descompte és fora de rang', () => {
  assert.throws(() => calcularTotal([], 120), RangeError);
});

test('el pes total suma el pes de cada item per la quantitat', () => {
  assert.equal(calcularPesTotal([{ pes: 2, quantitat: 3 }, { pes: 0.25, quantitat: 2 }]), 6.5);
});

test('un item sense pes compta com a 0,5 kg per unitat', () => {
  assert.equal(calcularPesTotal([{ quantitat: 3 }]), 1.5);
  assert.equal(calcularPesTotal([{ pes: null, quantitat: 1 }]), 0.5);
});

test('un pes de 0 es respecta i no es substitueix pel pes per defecte', () => {
  assert.equal(calcularPesTotal([{ pes: 0, quantitat: 2 }]), 0);
});

test('el pes total no acumula errors de coma flotant', () => {
  const items = [{ pes: 0.2, quantitat: 3 }, { pes: 0.4, quantitat: 1 }];
  assert.equal(calcularPesTotal(items), 1);
  assert.equal(calcularEnviament(items, 10), 3.9);
});

test('llança un error si el pes no és vàlid', () => {
  assert.throws(() => calcularPesTotal([{ pes: -1, quantitat: 1 }]), RangeError);
  assert.throws(() => calcularPesTotal([{ pes: '2', quantitat: 1 }]), RangeError);
});

test('aplica la tarifa segons el pes total, amb els límits inclosos al tram inferior', () => {
  assert.equal(calcularEnviament([{ pes: 1, quantitat: 1 }], 10), 3.9);
  assert.equal(calcularEnviament([{ pes: 1.001, quantitat: 1 }], 10), 5.9);
  assert.equal(calcularEnviament([{ pes: 5, quantitat: 1 }], 10), 5.9);
  assert.equal(calcularEnviament([{ pes: 5.001, quantitat: 1 }], 10), 9.9);
});

test('l\'enviament és gratuït només per sobre de 50 €', () => {
  const items = [{ pes: 2, quantitat: 1 }];
  assert.equal(calcularEnviament(items, 50), 5.9);
  assert.equal(calcularEnviament(items, 50.01), 0);
});

test('un carret buit no paga enviament', () => {
  assert.equal(calcularEnviament([], 0), 0);
  assert.deepEqual(calcularResum([]), { subtotal: 0, enviament: 0, total: 0 });
});

test('el resum coincideix amb l\'exemple del proveïdor', () => {
  const items = [{ preu: 15, quantitat: 3 }];
  assert.deepEqual(calcularResum(items), { subtotal: 45, enviament: 5.9, total: 50.9 });
});

test('l\'enviament gratuït es decideix després d\'aplicar el descompte', () => {
  const items = [{ preu: 60, quantitat: 1 }];
  assert.deepEqual(calcularResum(items), { subtotal: 60, enviament: 0, total: 60 });
  assert.deepEqual(calcularResum(items, 20), { subtotal: 48, enviament: 3.9, total: 51.9 });
});
