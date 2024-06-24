const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Asegúrate de que la ruta sea correcta

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
  admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users', // Asegúrate de que coincida exactamente con el nombre de la tabla en la migración
  timestamps: false, // Habilita las columnas createdAt y updatedAt
  freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
});

module.exports = User;

