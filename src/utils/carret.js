/**
 * Calcula el total del carret aplicant un descompte percentual.
 * @param {Array<{preu: number, quantitat: number}>} items
 * @param {number} descompte Percentatge entre 0 i 100.
 * @returns {number} Total arrodonit a 2 decimals.
 * @throws {RangeError} Si el descompte és fora de rang.
 */
export function calcularTotal(items, descompte = 0) {
  if (descompte < 0 || descompte > 100) {
    throw new RangeError('El descompte ha de ser entre 0 i 100');
  }
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.preu * item.quantitat;
  }
  const total = subtotal * (1 - descompte / 100);
  return Math.round(total * 100) / 100;
}
