// src/models/userModel.js

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate de tener una configuración adecuada para tu conexión a la BD

class User extends Model {}

User.init({
  // Definición de los atributos del modelo
  mail: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  money: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 5000.00,
  },
}, {
  sequelize,
  modelName: 'User',
  // Aquí puedes agregar opciones adicionales para el modelo
});

module.exports = User;
