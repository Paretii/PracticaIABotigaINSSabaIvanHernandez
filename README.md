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

## Tests

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
  utils/carret.js   Càlcul del total del carret
public/             Frontend (HTML, CSS i JavaScript)
test/               Tests amb el runner integrat de Node.js
docs/               Documentació de proveïdors externs
```
