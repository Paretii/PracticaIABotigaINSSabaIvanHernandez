# Botiga Copilot

Mini-botiga en línia per practicar la programació assistida amb GitHub Copilot.

## Requisits

- Node.js 22.13 o superior (recomanat: Node.js 24 LTS)

## Instal·lació i execució

```bash
npm install
npm start
```

Obre <http://localhost:3000> al navegador.

## API

| Mètode | Ruta                       | Descripció                                         |
|--------|----------------------------|----------------------------------------------------|
| GET    | `/api/productes`           | Llista els productes; admet `?categoria=roba`      |
| GET    | `/api/productes/:id`       | Retorna un producte                                |
| GET    | `/api/categories`          | Llista les categories amb el nombre de productes   |
| GET    | `/api/ressenyes`           | Llista les ressenyes d'un producte (`?producteId=1`) |
| POST   | `/api/ressenyes`           | Crea una ressenya                                  |
| POST   | `/api/carret/total`        | Calcula el resum del carret, amb l'enviament       |

### GET /api/productes

Cada producte inclou dos camps calculats a partir de les ressenyes:

- `mitjana`: puntuació mitjana arrodonida a 1 decimal, o `null` si no té ressenyes.
- `numRessenyes`: nombre de ressenyes del producte.

```json
[
  {
    "id": 1,
    "nom": "Samarreta Vallès",
    "descripcio": "Samarreta de cotó orgànic",
    "categoria": "roba",
    "preu": 19.95,
    "mitjana": 4,
    "numRessenyes": 2
  }
]
```

`GET /api/productes/:id` no inclou aquests dos camps.

### GET /api/categories

Retorna les categories ordenades alfabèticament, amb el nombre de productes de cadascuna:

```json
[
  { "categoria": "casa", "numProductes": 2 },
  { "categoria": "papereria", "numProductes": 2 },
  { "categoria": "roba", "numProductes": 2 }
]
```

Si la consulta falla, respon 500 amb `{ "error": "No s'han pogut obtenir les categories" }`.

### POST /api/carret/total

El cos és un JSON amb `items` i `descompte`, tots dos opcionals. `descompte` és un percentatge entre 0 i 100, i `pes` és el pes per unitat en kg:

```json
{
  "items": [{ "preu": 10, "quantitat": 2, "pes": 0.5 }],
  "descompte": 10
}
```

La resposta separa l'import dels productes i el cost d'enviament:

```json
{ "subtotal": 18, "enviament": 3.9, "total": 21.9 }
```

- `subtotal`: import dels productes amb el descompte aplicat.
- `enviament`: cost d'enviament.
- `total`: suma de `subtotal` i `enviament`.

El cost d'enviament depèn del pes total del carret:

| Pes total          | Enviament |
|--------------------|-----------|
| Fins a 1 kg        | 3,90 €    |
| Fins a 5 kg        | 5,90 €    |
| Més de 5 kg        | 9,90 €    |

- L'enviament és gratuït si el subtotal, ja amb el descompte aplicat, supera els 50 €.
- Un carret buit no paga enviament.
- Els items sense `pes` compten com a 0,5 kg per unitat.

Si el descompte és fora de rang o algun pes no és vàlid, respon 400 amb `{ "error": "missatge" }`.

## Tests

Els tests fan servir el runner integrat de Node.js i són a la carpeta `test/`. No cal tenir el servidor engegat, però sí haver executat `npm install`.

```bash
npm test
```

## Estructura

```
src/
  index.js          Punt d'entrada: inicia el servidor
  app.js            Configuració d'Express i rutes
  config.js         Configuració de l'aplicació
  db.js             Base de dades SQLite en memòria amb dades de prova
  routes/           Rutes de l'API
  utils/carret.js   Càlcul del total, el pes i l'enviament del carret
public/             Frontend (HTML, CSS i JavaScript)
test/               Tests amb el runner integrat de Node.js
docs/               Documentació de proveïdors externs
```
