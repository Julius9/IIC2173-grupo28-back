const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Asegúrate de que la ruta sea correcta

console.log("Estoy en el modelo de vuelos");

class Flight extends Model {}

Flight.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departure_airport_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    departure_airport_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    departure_airport_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    arrival_airport_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    arrival_airport_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    arrival_airport_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    duration: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    airplane: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    airline: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    airline_logo: {
        type: DataTypes.STRING(255)
    },
    carbon_emissions: {
        type: DataTypes.DECIMAL
    },
    price: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    airlinelogo: {
        type: DataTypes.STRING(255)  // Duplicado de airline_logo, puede ser eliminado si es un error
    },
    tickets_left: {
        type: DataTypes.INTEGER,
        defaultValue: 90
    }
}, {
    sequelize,
    modelName: 'Flight', // Nombre del modelo
    tableName: 'flights', // Nombre de la tabla en la base de datos
    timestamps: false, // Asumiendo que no quieres campos de timestamp automáticos (createdAt y updatedAt)
    freezeTableName: true,
});

export default Flight;