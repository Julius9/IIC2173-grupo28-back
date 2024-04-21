// src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { register, login } = require('./authController');

// Ruta para el registro de usuarios
router.post('/register', asyncHandler(register));

// Ruta para el inicio de sesión de usuarios
router.post('/login', asyncHandler(login));

module.exports = router;
