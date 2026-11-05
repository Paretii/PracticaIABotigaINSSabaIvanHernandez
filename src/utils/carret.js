const PES_PER_DEFECTE = 0.5;
const LLINDAR_ENVIAMENT_GRATUIT = 50;

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

/**
 * Calcula el pes total del carret. Els items sense pes compten com a 0,5 kg per unitat.
 * @param {Array<{quantitat: number, pes?: number}>} items
 * @returns {number} Pes total en kg, arrodonit al gram.
 * @throws {RangeError} Si algun pes no és un nombre positiu.
 */
export function calcularPesTotal(items) {
  let pesTotal = 0;
  for (const item of items) {
    const pes = item.pes ?? PES_PER_DEFECTE;
    if (typeof pes !== 'number' || pes < 0) {
      throw new RangeError('El pes ha de ser un nombre positiu');
    }
    pesTotal += pes * item.quantitat;
  }
  return Math.round(pesTotal * 1000) / 1000;
}

/**
 * Calcula el cost d'enviament segons les tarifes d'Enviaments Express.
 * @param {Array<{quantitat: number, pes?: number}>} items
 * @param {number} subtotal Import de la comanda després de descomptes.
 * @returns {number} Cost d'enviament; 0 si el carret és buit o l'enviament és gratuït.
 * @throws {RangeError} Si algun pes no és un nombre positiu.
 */
export function calcularEnviament(items, subtotal) {
  const pesTotal = calcularPesTotal(items);
  if (items.length === 0 || subtotal > LLINDAR_ENVIAMENT_GRATUIT) return 0;
  if (pesTotal <= 1) return 3.9;
  if (pesTotal <= 5) return 5.9;
  return 9.9;
}

/**
 * Calcula el resum del carret: subtotal amb descompte, enviament i total.
 * @param {Array<{preu: number, quantitat: number, pes?: number}>} items
 * @param {number} descompte Percentatge entre 0 i 100.
 * @returns {{subtotal: number, enviament: number, total: number}}
 * @throws {RangeError} Si el descompte o algun pes no són vàlids.
 */
export function calcularResum(items, descompte = 0) {
  const subtotal = calcularTotal(items, descompte);
  const enviament = calcularEnviament(items, subtotal);
  const total = Math.round((subtotal + enviament) * 100) / 100;
  return { subtotal, enviament, total };
}
