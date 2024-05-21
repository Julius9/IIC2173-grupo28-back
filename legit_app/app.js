const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
// Poner el path del archivo flights_mqtt_request_validation.js esta en la carpeta brokers , aqui abajo
const mqtt_request = require('./flights_mqtt_request');
const mqtt_validation = require('./flights_mqtt_validation');
const { v4: uuidv4 } = require('uuid');
const { IPinfoWrapper } = require("node-ipinfo");
const authenticateToken = require('./authenticateToken');
const tx = require('./utils/trx');

var cors = require('cors');

// Configuración de la aplicación

// enable cors:
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Headers', 'Origin','Accept', 'X-Requested-With', 'Content-Type', 'Access-Control-Request-Method', 'Access-Control-Request-Headers', 'Auth'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};




const app = express();
app.use(cors(corsOptions));
app.use(express.json());
const port = process.env.PORT || 3000;

// Ruta al archivo de configuración
const configPath = path.resolve(__dirname, './config.json');

// Leer la configuración del archivo
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

let lastUpdate = null;

const ipinfo = new IPinfoWrapper(config.IPINFO_TOKEN);

// Configuración de la conexión a la base de datos
const dbClient = new Client({
    user: config.DB_USER,
    host: config.DB_HOST,
    database: config.DB_NAME,
    password: config.DB_PASSWORD,
    port: config.DB_PORT,
});

// Conectar a la base de datos de usuarios
// const dbClientUsers = new Client({


// Conectar a la base de datos al iniciar la aplicación
dbClient.connect()
    .then(() => {
        console.log('Conexión a la base de datos establecida');
    })
    .catch(err => {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1); // Salir de la aplicación en caso de error de conexión
    });

// Analizar solicitudes con cuerpo JSON
app.use(bodyParser.json());

// Función para buscar el vuelo por ID
async function findFlightById(flightId) {
    try {
        
        // Consulta SQL para buscar el vuelo por ID
        const query = 'SELECT * FROM flights WHERE id = $1';
        const values = [flightId];
        
        // Ejecutar la consulta
        const result = await dbClient.query(query, values);

        // Manejar el resultado de la consulta
        if (result.rows.length > 0) {
            // Si se encuentra el vuelo, devolver sus detalles
            return result.rows[0];
        } else {
            // Si no se encuentra el vuelo, devolver un mensaje de error
            throw new Error('No se encontró el vuelo con el ID proporcionado');
        }
    } catch (error) {
        throw new Error('Error al buscar el vuelo en la base de datos: ' + error.message);
    }
}

async function findTransactionByToken(token) {
    try {
        const query = 'SELECT * FROM transaction WHERE token = $1';
        const values = [token];
        const result = await dbClient.query(query, values);
        if (result.rows.length > 0) {
            return result.rows[0];
        } else {
            throw new Error('No se encontró la transacción con el token proporcionado');
        }
    } catch (error) {
        throw new Error('Error al buscar la transacción en la base de datos: ' + error.message);
    }
}

async function getCityFromIP(ipAddress) {
    try {
        // Obtener la información de la IP usando ipinfo
        const response = await ipinfo.lookupIp(ipAddress);

        // Verificar si se recibió una respuesta válida
        if (response && response.city && response.country) {
            // Devolver la ciudad obtenida de la respuesta
            return `${response.city}, ${response.country}`;
        } else {
            // Si no se recibió una respuesta válida o no hay información de ciudad, lanzar un error
            throw new Error('No se pudo obtener la ciudad para la dirección IP proporcionada');
        }
    } catch (error) {
        // Capturar cualquier error que ocurra durante la obtención de la información de la IP
        console.error('Error al obtener la ciudad de la IP:', error);
        throw new Error('Error al obtener la ciudad para la dirección IP proporcionada');
    }
}

async function updateFlightTickets(flightId, updatedTicketsLeft) {
    const query = 'UPDATE flights SET tickets_left = $1 WHERE id = $2';
    await dbClient.query(query, [updatedTicketsLeft, flightId]);
}

async function formatearFechaVuelo(date) {
    const year = date.getUTCFullYear(); // Año
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Mes, +1 porque getMonth devuelve 0-11
    const day = date.getUTCDate().toString().padStart(2, '0'); // Día
    const hours = date.getUTCHours().toString().padStart(2, '0'); // Hora
    const minutes = date.getUTCMinutes().toString().padStart(2, '0'); // Minutos

    // Combinar los componentes en el formato deseado
    const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}`;
    return formattedTime;
}

async function createTransaction(flight_id, quantity, user_id) {
    const flight = await findFlightById(flight_id);
    if (!flight) {
        throw new Error("Vuelo no encontrado");
    }
    const amount = flight.price * Number(quantity);
    
    const query = 'INSERT INTO transaction (flight_id, user_id, quantity, amount, status) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [flight_id, user_id, quantity, amount, 'pending'];
    const newTrx = await dbClient.query(query, values);
    const result = newTrx.rows[0];
    return result;
}

async function updateTransactionStatus(status, token) {
    const query = 'UPDATE transaction SET status = $1 WHERE token = $2';
    const values = [status, token];
    await dbClient.query(query, values);

    return await findTransactionByToken(token);
}

async function updateTransactionToken(transaction_id, token) {
    const query = 'UPDATE transaction SET token = $1 WHERE id = $2';
    const values = [token, transaction_id];
    await dbClient.query(query, values);
}

// Endpoint para recibir nuevos vuelos
app.post('/flights', async (req, res) => {
    try {

        // Validar que se recibieron datos en el cuerpo de la solicitud
        if (!req.body || !req.body.flights || !req.body.carbonEmission) {
            return res.status(400).json({ error: 'Datos de vuelo incompletos' });
        }

        const flightData = req.body;
        const flightsString = flightData.flights;
        const carbonEmissionString = flightData.carbonEmission;

        // Validar que los datos de vuelo y emisión de carbono sean cadenas JSON válidas
        let flights, carbonEmission;
        try {
            flights = JSON.parse(flightsString);
            carbonEmission = JSON.parse(carbonEmissionString);
        } catch (error) {
            console.log('Error al analizar los datos de vuelo o emisión de carbono:', error);
            return res.status(400).json({ error: 'Datos de vuelo o emisión de carbono inválidos' });
        }

        // Iterar sobre cada vuelo y extraer los datos relevantes
        for (const flight of flights) {
            const departureAirport = flight.departure_airport;
            const arrivalAirport = flight.arrival_airport;

            // Insertar los datos en la base de datos
            await dbClient.query(`
                INSERT INTO flights (
                    departure_airport_name, departure_airport_id, departure_airport_time,
                    arrival_airport_name, arrival_airport_id, arrival_airport_time,
                    duration, airplane, airline, airline_logo,
                    carbon_emissions, price, currency, airlineLogo, tickets_left
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            `, [
                departureAirport.name, departureAirport.id, departureAirport.time,
                arrivalAirport.name, arrivalAirport.id, arrivalAirport.time,
                flight.duration, flight.airplane, flight.airline, flight.airline_logo,
                carbonEmission ? carbonEmission.this_flight : null,
                flightData.price, flightData.currency, flightData.airlineLogo, 90
            ]); 
        }

        // Devolver los datos recibidos
        res.status(200).json({flights: flights, carbonEmission: carbonEmission});
        lastUpdate = new Date();
    } catch (error) {
        console.error('Error al insertar datos de vuelo:', error);
        res.status(500).json({ error: 'Error al insertar datos de vuelo' });
    }
});


// Endpoint para obtener la lista de vuelos filtrados y paginados
app.get('/flights', async (req, res) => {
    try {
        console.log('Obteniendo lista de vuelos filtrada y paginada...');
        // Obtener los parámetros de consulta
        const departure = req.query.departure;
        const arrival = req.query.arrival;
        const date = req.query.date;
        const page = parseInt(req.query.page) || 1; // Página por defecto: 1
        const count = parseInt(req.query.count) || 25; // Cantidad por página por defecto: 25

        // Calcular el índice de inicio y el límite
        const startIndex = (page - 1) * count;
        

        // Construir la consulta SQL base
        let query = 'SELECT * FROM flights';

        // Parámetros para la consulta SQL
        const queryParams = [];
        console.log('queryParams:');
        console.log('departure:', departure);
        console.log('arrival:', arrival);
        console.log('date:', date);


        // Agregar filtros si se proporcionan en la URL
        if (departure && arrival && date) {
            console.log('Filtrar por destino, salida y fecha');
            query += ' WHERE departure_airport_id = $1 AND arrival_airport_id = $2 AND departure_airport_time::date = $3';
            queryParams.push(departure, arrival, date);
        }
        else if (arrival && date) {
            console.log('Filtrar por salida y fecha');
            query += ' WHERE arrival_airport_id = $1 AND departure_airport_time::date = $2';
            queryParams.push(arrival, date);
        }
        else if (arrival) {
            console.log('Filtrar por salida');
            query += ' WHERE arrival_airport_id = $1';
            queryParams.push(arrival);
        }
        else if (date) {
            console.log('Filtrar por fecha');
            query += ' WHERE departure_airport_time::date = $1';
            queryParams.push(date);
        }

        // Agregar paginación a la consulta SQL
        query += ' ORDER BY id LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
        queryParams.push(count, startIndex);

        // Consultar la base de datos para obtener los vuelos filtrados y paginados
        const result = await dbClient.query(query, queryParams);

        // Construir la respuesta paginada
        const flights = result.rows;
        const totalPages = Math.ceil(flights.length / count);
        


        // Crear el objeto de respuesta
        const response = {
            currentPage: page,
            totalPages: totalPages,
            totalCount: flights.length,
            flights: flights,
            lastUpdate: lastUpdate
        };

        // Enviar la respuesta al cliente
        res.json(response);
    } catch (error) {
        // Enviar un mensaje de error al cliente si ocurre algún problema
        console.error('Error al obtener la lista de vuelos filtrada y paginada:', error);
        res.status(500).json({ error: 'Error al obtener la lista de vuelos filtrada y paginada' });
    }
});


// Endpoint para mostrar el detalle de un vuelo específico
app.get('/flights/:id', async (req, res) => {
    const flightId = req.params.id;

    try {
        // Buscar el vuelo en la base de datos por ID
        const flight = await findFlightById(flightId);

        // Enviar la respuesta al cliente con los detalles del vuelo
        res.json(flight);
    } catch (error) {
        // Enviar un mensaje de error al cliente si ocurre algún problema
        res.status(404).json({ error: error.message });
    }
});

app.post('/transaction/create', authenticateToken, async (req, res) => {
    try {
        const { flight_id, quantity } = req.body;
        console.log(req.body);
        console.log("Se recibio una solicitud de transaccion");
        
        const user_id = req.user.id;

        const request_id = await reservarFlight(flight_id, quantity);

        const newTrx = await createTransaction(flight_id, quantity, user_id);
    
        console.log("Se creo una nueva transaccion");
        // hacer transaccionID a string

        console.log(newTrx);
        const transactionID = newTrx.id.toString();
        const amount = quantity * Number(newTrx.amount);
        // // USO: tx.create(transactionId, nombreComercio, monto, urlRetorno)
        const trx = await tx.create(transactionID, "test-iic2173", amount, process.env?.REDIRECT_URL || "http://localhost:5173/compra-completada");
        
        await updateTransactionToken(newTrx.id, trx.token);

        const response = {
            ...trx,
            request_id
        }
        // res
        res.status(200).json(response);
    } catch (e) {
    console.log(e);
    }
    return;
});

app.post('/transaction/commit', authenticateToken, async (req, res) => {
    const { ws_token, request_id } = req.body;
    if (!ws_token || ws_token == "") {
      res.status(200).json({
        message: "Transaccion anulada por el usuario"
      });
      await validateFlightRequest(request_id, false, ws_token, req);
      return;
    }
    const confirmedTx = await tx.commit(ws_token);
    
    let trx;

    if (confirmedTx.response_code != 0) { // Rechaza la compra
      trx = await updateTransactionStatus('rejected', ws_token);
      res.status(200).json( {
        message: "Transaccion ha sido rechazada",
        flight: trx.flight_id,
        quantity: trx.quantity
  
      });
      await validateFlightRequest(request_id, false, ws_token, req);
      return;
    }
    
    trx = await updateTransactionStatus('completed', ws_token);
    await validateFlightRequest(request_id, true, ws_token, req);

    res.status(200).json ({
      message: "Transaccion ha sido aceptada",
      flight: trx.flight_id,
      quantity: trx.quantity
    });
    return;
});


async function reservarFlight(flightID, ticketsToBook){
    try {
        // Buscar el vuelo actual en la base de datos
        const flight = await findFlightById(flightID);

        // Actualizar la cantidad de tickets disponibles
        const updatedTicketsLeft = flight.tickets_left - ticketsToBook;
        await updateFlightTickets(flightID, updatedTicketsLeft);
        
        const requestResponse = {
            "request_id": uuidv4().toString(),
            "group_id": "28",
            "departure_airport": flight.departure_airport_id,
            "arrival_airport": flight.arrival_airport_id,
            "departure_time": await formatearFechaVuelo(flight.departure_airport_time),
            "datetime": new Date().toISOString(),
            "deposit_token": "",  // Asigna un token si es necesario
            "quantity": ticketsToBook,
            "seller": 0
        };

        const request_id = mqtt_request.publishRequest(requestResponse);
        return request_id;
        
    } catch (error) {
        throw new Error('Error al reservar tickets de vuelo: ' + error.message);
    }
}

// Endpoint para reservar tickets de un vuelo específico

async function validateFlightRequest(request_id, valid, token, req) {
    try {
        const validResponse = {
            "request_id": request_id,
            "group_id": "28",
            "seller": 0,
            "valid": valid
        };
        mqtt_validation.publishValidation(validResponse);
        
        const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        let clientCity;
        if (!clientIp) {
            // throw new Error('No se pudo obtener la dirección IP del cliente.');
            clientCity = 'Desconocido';
        } else {
            try {
                // Se guarda la ciudad del cliente
                clientCity = await getCityFromIP(clientIp);
            } catch (error) {
                clientCity = 'Desconocido';
                console.log('Error al obtener la ciudad del cliente:', error);
            }
        }

        const transaction = await findTransactionByToken(token);

        const query = 'INSERT INTO purchases (flight_id, user_id, quantity, total_price, purchase_date, location) VALUES ($1, $2, $3, $4, $5, $6)';
        const values = [transaction.flight_id, transaction.user_id, transaction.quantity, transaction.amount, new Date(), clientCity];
        dbClient.query(query, values);

    } catch (error) {
        throw new Error('Error al validar la solicitud de vuelo: ' + error.message);
    }
}


app.post('/flights/:id/check', authenticateToken, async (req, res) => {
    const flightId = req.params.id;
    const ticketsToBook = req.body.ticketsToBook;  // La cantidad de tickets a descontar

    try {
        // Buscar el vuelo actual en la base de datos
        const flight = await findFlightById(flightId);
        if (!flight) {
            throw new Error("Vuelo no encontrado");
        }

        // Verificar si hay suficientes tickets disponibles
        if (flight.tickets_left < ticketsToBook) {
            throw new Error("No hay suficientes tickets disponibles para reservar, seleccione una cantidad menor");
        } else if (ticketsToBook <= 0) {
            throw new Error("La cantidad de tickets a reservar debe ser mayor que cero");
        }
        res.status(200).json({ valid: true, flight: flight, ticketsToBook: ticketsToBook });
    } catch (error) {
        res.status(400).json({ valid: false, error: error.message });
    }
});


// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor API escuchando en el puerto ${port}`);
});

// Cerrar la conexión a la base de datos al detener la aplicación
process.on('SIGINT', async () => {
    try {
        console.log('Cerrando conexión a la base de datos...');
        await dbClient.end(); // Cerrar la conexión
        console.log('Conexión a la base de datos cerrada');
        process.exit(0); // Salir de la aplicación
    } catch (err) {
        console.error('Error al cerrar la conexión a la base de datos:', err);
        process.exit(1); // Salir de la aplicación con error
    }
});


