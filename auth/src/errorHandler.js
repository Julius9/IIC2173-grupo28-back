// src/middleware/errorHandler.js

const errorHandler = (err, req, res) => {
    // Podrías agregar lógica para diferenciar los tipos de errores
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
  
    // Log del error para el registro en el servidor
    console.error(err);
  
    // Envío de la respuesta de error
    res.status(statusCode).json({
      status: "error",
      statusCode,
      message
    });
  };
  
  module.exports = errorHandler;
  