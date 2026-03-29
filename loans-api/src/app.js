const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const tableConfigs = require('./shared/tableConfigs');
const SqlCrudRepository = require('./infrastructure/repositories/SqlCrudRepository');
const createCrudController = require('./presentation/controllers/createCrudController');
const createCrudRoutes = require('./presentation/routes/createCrudRoutes');
const swaggerSpec = require('./docs/swagger');

const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api', (req, res) => {
    res.json({
      message: 'Loan System REST API',
      resources: tableConfigs.map((config) => ({
        resource: config.resource,
        endpoint: `/api/${config.resource}`
      }))
    });
  });

  app.get('/api-docs.json', (req, res) => {
    res.json(swaggerSpec);
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  tableConfigs.forEach((tableConfig) => {
    const repository = new SqlCrudRepository(tableConfig);
    const controller = createCrudController(tableConfig, repository);
    app.use(`/api/${tableConfig.resource}`, createCrudRoutes(controller));
  });

  app.use((err, req, res, next) => {
    console.error(err);
    
    if (err && ['ESOCKET', 'ETIMEOUT', 'ELOGIN', 'ENOTOPEN', 'ENOTFOUND'].includes(err.code)) {
      return res.status(503).json({
        message: 'Database connection is unavailable. Check SQL Server instance and connection settings.'
      });
    }

    return res.status(500).json({ message: 'Internal server error' });
  });

  return app;
};

module.exports = createApp;
