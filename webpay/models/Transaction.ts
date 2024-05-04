const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Asegúrate de que la ruta sea correcta

class Transaction extends Model {}

Transaction.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    token: {
        type: DataTypes.STRING(255),
        unique: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Nombre del modelo referenciado como está definido en Sequelize
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    flight_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'flights', // Nombre del modelo referenciado como está definido en Sequelize
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'transaction', // Nombre del modelo
    tableName: 'transaction', // Nombre de la tabla en la base de datos
    timestamps: false, // Asumiendo que no quieres columnas de timestamp automáticas (createdAt y updatedAt)
    freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla
});

export default Transaction;
