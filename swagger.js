const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Tasks Todo API Engine',
    description: 'Production-grade interactive API documentation suite.',
    version: '1.0.0'
  },
  host: 'localhost:7000',
  basePath: '/api/v1', // 🎯 Synchronized with yesterday's versioning prefix!
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Enter your token with the "Bearer " prefix (e.g., Bearer eyJhbGci...)'
    }
  }
};

const outputFile = './swagger-output.json';
const routesFiles = ['./model_test.js']; 


swaggerAutogen(outputFile, routesFiles, doc);