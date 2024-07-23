// swaggerConfig.js

export const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Hono API',
      version: '1.0.0',
      description: 'API documentation for Hono application'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'] // Path to the API docs
};
