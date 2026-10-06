const app = require('./app');
const env = require('./config/env');
const runMigrations = require('./config/migrate');

async function start() {
  try {
    await runMigrations();
    app.listen(env.port, () => {
      console.log(`URBANTIC API listening on port ${env.port}`);
    });
  } catch (error) {
    console.error('Could not start URBANTIC API:', error);
    process.exit(1);
  }
}

start();
