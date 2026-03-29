const swaggerJsdoc = require('swagger-jsdoc');
const tableConfigs = require('../shared/tableConfigs');

const toPascalCase = (value) => value
  .split('-')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('');

const buildExampleValue = (field) => {
  const lower = field.toLowerCase();

  if (lower.includes('id')) {
    return 1;
  }

  if (lower.includes('email')) {
    return 'user@example.com';
  }

  if (lower.includes('date') || lower.includes('at')) {
    return '2026-03-28T10:30:00Z';
  }

  if (lower.includes('amount') || lower.includes('rate')) {
    return 1000.5;
  }

  if (lower.includes('month')) {
    return 12;
  }

  if (lower.includes('active')) {
    return true;
  }

  return 'string';
};

const buildPropertyType = (field, value) => {
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { type: 'integer' }
      : { type: 'number', format: 'float' };
  }

  if (typeof value === 'boolean') {
    return { type: 'boolean' };
  }

  if (field.toLowerCase().includes('date') || field.toLowerCase().includes('at')) {
    return { type: 'string', format: 'date-time' };
  }

  return { type: 'string' };
};

const buildSchemas = () => {
  const schemas = {};

  tableConfigs.forEach((table) => {
    const schemaName = `${toPascalCase(table.resource)}Entity`;
    const createSchemaName = `${toPascalCase(table.resource)}Create`;
    const updateSchemaName = `${toPascalCase(table.resource)}Update`;

    const baseFields = [table.idField, ...table.columns.map((column) => column.field), 'createdAt'];
    const createFields = table.columns.map((column) => column.field);

    const baseProperties = {};
    baseFields.forEach((field) => {
      const example = buildExampleValue(field);
      baseProperties[field] = {
        ...buildPropertyType(field, example),
        example
      };
    });

    const createProperties = {};
    createFields.forEach((field) => {
      const example = buildExampleValue(field);
      createProperties[field] = {
        ...buildPropertyType(field, example),
        example
      };
    });

    schemas[schemaName] = {
      type: 'object',
      properties: baseProperties,
      required: [table.idField, ...table.columns.filter((column) => column.required).map((column) => column.field)]
    };

    schemas[createSchemaName] = {
      type: 'object',
      properties: createProperties,
      required: table.columns.filter((column) => column.required).map((column) => column.field)
    };

    schemas[updateSchemaName] = {
      type: 'object',
      properties: createProperties
    };
  });

  return schemas;
};

const buildPaths = () => {
  const paths = {};

  tableConfigs.forEach((table) => {
    const resource = table.resource;
    const schemaName = `${toPascalCase(resource)}Entity`;
    const createSchemaName = `${toPascalCase(resource)}Create`;
    const updateSchemaName = `${toPascalCase(resource)}Update`;

    paths[`/api/${resource}`] = {
      get: {
        tags: [resource],
        summary: `List all ${resource}`,
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: `#/components/schemas/${schemaName}`
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: [resource],
        summary: `Create a ${resource} record`,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: `#/components/schemas/${createSchemaName}`
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${schemaName}`
                }
              }
            }
          }
        }
      }
    };

    paths[`/api/${resource}/{id}`] = {
      get: {
        tags: [resource],
        summary: `Get ${resource} by id`,
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${schemaName}`
                }
              }
            }
          },
          404: { description: 'Not found' }
        }
      },
      put: {
        tags: [resource],
        summary: `Update ${resource} by id`,
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: `#/components/schemas/${updateSchemaName}`
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Updated',
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${schemaName}`
                }
              }
            }
          },
          404: { description: 'Not found' }
        }
      },
      delete: {
        tags: [resource],
        summary: `Delete ${resource} by id`,
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          200: {
            description: 'Deleted',
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${schemaName}`
                }
              }
            }
          },
          404: { description: 'Not found' }
        }
      }
    };
  });

  return paths;
};

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Loans API',
    version: '1.0.0',
    description: 'REST API for Loan System with SQL Server and modular clean architecture.'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local'
    }
  ],
  tags: tableConfigs.map((table) => ({ name: table.resource })),
  paths: buildPaths(),
  components: {
    schemas: buildSchemas()
  }
};

const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: []
});

module.exports = swaggerSpec;
