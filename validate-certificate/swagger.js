import swaggerJsdoc from "swagger-jsdoc";
import dotenv from "dotenv";

dotenv.config();

const LOCAL = process.env.LOCAL;
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Validate Certificate API",
      version: "2.0.0",
      description: "API para validação de certificados digitais",
    },
    servers: [
      {
        url: `http://${LOCAL}:3001`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./app.js", "./auth.js"], // arquivos que contêm as anotações
};

export const specs = swaggerJsdoc(options);
