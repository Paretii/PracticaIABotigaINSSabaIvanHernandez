# Botiga Claude

## Stack
- Backend: Node.js amb Express i SQLite (mòdul `node:sqlite`), amb mòduls ES (`import`/`export`).
- Frontend: HTML, CSS i JavaScript sense frameworks.
- Tests: runner integrat de Node.js (`node:test` i `node:assert/strict`).

## Convencions
- Noms de variables, funcions i missatges en català, en camelCase.
- Els errors de l'API es retornen en JSON amb el format `{ "error": "missatge" }` i el codi HTTP adequat.

## Arquitectura
- Cada recurs té el seu router a `src/routes/` que rep `db` com a paràmetre.
- La lògica pura (càlculs) va a `src/utils/`, separada de les rutes.

## No facis
- No afegeixis dependències noves sense demanar-ho.
- No concatenis mai dades de l'usuari a una consulta SQL: fes servir sempre consultes preparades (`?`).
- No insereixis dades de l'API a l'HTML amb `innerHTML`; fes servir `textContent`.
- No modifiquis tests existents perquè passin.
- No posis claus ni secrets al codi: llegeix-los de variables d'entorn.