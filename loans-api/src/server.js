const createApp = require('./app');
const config = require('./shared/config');
const { initializeDatabase } = require('./infrastructure/db/sqlServer');

const start = async () => {
  try {
    try {
      await initializeDatabase();
      console.log('Database initialization completed.');
    } catch (dbError) {
      console.warn('Database initialization skipped:', dbError.message);
      console.warn('API is running, but data endpoints require SQL Server connectivity.');
    }

    const app = createApp();
    app.listen(config.port, () => {
      console.log(`loans-api running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start loans-api:', error);
    process.exit(1);
  }
};

start();
