const carret = [];

async function carregarProductes(categoria = '') {
  const resposta = await fetch(`/api/productes?categoria=${categoria}`);
  const productes = await resposta.json();
  const contenidor = document.querySelector('#productes');
  contenidor.innerHTML = '';
  for (const p of productes) {
    const targeta = document.createElement('article');
    targeta.className = 'producte';
    targeta.innerHTML = `
      <h3>${p.nom}</h3>
      <p>${p.preu.toFixed(2)} €</p>
      <button class="afegeix">Afegeix</button>
      <button class="veure">Ressenyes</button>
    `;
    targeta.querySelector('.afegeix').addEventListener('click', () => afegirAlCarret(p));
    targeta.querySelector('.veure').addEventListener('click', () => obrirDetall(p));
    contenidor.appendChild(targeta);
  }
}

async function afegirAlCarret(producte) {
  const existent = carret.find((i) => i.id === producte.id);
  if (existent) {
    existent.quantitat++;
  } else {
    carret.push({ id: producte.id, nom: producte.nom, preu: producte.preu, quantitat: 1 });
  }
  await actualitzarCarret();
}

async function actualitzarCarret() {
  document.querySelector('#carret').innerHTML = carret
    .map((i) => `<li>${i.nom} × ${i.quantitat}</li>`)
    .join('');
  const resposta = await fetch('/api/carret/total', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: carret, descompte: 10 }),
  });
  const { total } = await resposta.json();
  document.querySelector('#total').textContent = `${total.toFixed(2)} €`;
}

let producteActual = null;

async function obrirDetall(producte) {
  producteActual = producte;
  document.querySelector('#detall-nom').textContent = producte.nom;
  document.querySelector('#detall-descripcio').textContent = producte.descripcio;
  await carregarRessenyes(producte.id);
  document.querySelector('#detall').showModal();
}

async function carregarRessenyes(producteId) {
  const resposta = await fetch(`/api/ressenyes?producteId=${producteId}`);
  const ressenyes = await resposta.json();
  document.querySelector('#ressenyes').innerHTML = ressenyes
    .map((r) => `<li><strong>${r.autor}</strong> (${r.puntuacio}/5): ${r.text}</li>`)
    .join('');
}

document.querySelector('#form-ressenya').addEventListener('submit', async (e) => {
  e.preventDefault();
  const dades = Object.fromEntries(new FormData(e.target));
  await fetch('/api/ressenyes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...dades, producteId: producteActual.id }),
  });
  e.target.reset();
  await carregarRessenyes(producteActual.id);
});

document.querySelector('#tanca').addEventListener('click', () => {
  document.querySelector('#detall').close();
});

document.querySelector('#filtre-categoria').addEventListener('change', (e) => {
  carregarProductes(e.target.value);
});

carregarProductes();
