import { crearApp } from './app.js';
import { crearBaseDades } from './db.js';
import { config } from './config.js';

const db = crearBaseDades();
const app = crearApp(db);

app.listen(config.port, () => {
  console.log(`Botiga en marxa a http://localhost:${config.port}`);
});
