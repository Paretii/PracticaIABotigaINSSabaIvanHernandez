import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularTotal } from '../src/utils/carret.js';

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
