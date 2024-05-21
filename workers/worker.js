const Queue = require('bull');
const axios = require('axios');
const { Client } = require('pg');

// CLAVE DE GOOGLE GEOCODING API
const googleApiKey = process.env.GAPI_KEY;


// Configuración de la conexión Redis
const redisConfig = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASS,
};

// Configuracion de la base de datos
const dbConfig = {
    user: 'postgres',
    host: 'database', // Este es el nombre del servicio en el archivo docker-compose.yml
    database: 'flights',
    password: 'postgres',
    port: 5432,
};

// Creacion del cliente Postgres:
const dbClient = new Client(dbConfig);
dbClient.connect();

// Crear una cola de Bull
const recommendationQueue = new Queue('flight-recommendation', { redis: redisConfig });

// escribe la inicializacion en la consola 
console.log('Worker configured and ready to process jobs');

// Función para obtener las coordenadas de la IP del usuario
async function getUserCoordinates(userIp) {
  if (!userIp) {
      throw new Error('userIp is undefined');
  }
  try {
      const url = `http://ip-api.com/json/${userIp}`;
      console.log(`Fetching URL: ${url}`);
      const response = await axios.get(url);
      console.log('Response data:', response.data);
      const { lat, lon } = response.data;
      if (lat === undefined || lon === undefined) {
          throw new Error('Could not get coordinates from IP API');
      }
      return { lat, lon };
  } catch (error) {
      console.error('Error obteniendo coordenadas de usuario:', error);
      throw error;
  }
}

// Función para obtener el último vuelo comprado por el usuario
async function getLastFlight(userId) {
    try {
        const result = await dbClient.query(
            'SELECT * FROM purchases WHERE user_id = $1 ORDER BY purchase_date DESC LIMIT 1',
            [userId]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error obteniendo último vuelo:', error);
        throw error;
    }
}

// Función para obtener los 20 vuelos más recientes desde un aeropuerto
async function getRecentFlights(departureAirport) {
    try {
        const result = await dbClient.query(
            'SELECT * FROM flights WHERE departure_airport_id = $1 ORDER BY departure_airport_time DESC LIMIT 20',
            [departureAirport]
        );
        return result.rows;
    } catch (error) {
        console.error('Error obteniendo vuelos recientes:', error);
        throw error;
    }
}

// Función para obtener las coordenadas de los aeropuertos de destino
async function getAirportCoordinates(airportIds) {
    try {
        const promises = airportIds.map(async (id) => {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
                params: {
                    address: id,
                    key: googleApiKey
                }
            });

            if (response.data.status === 'OK') {
                const location = response.data.results[0].geometry.location;
                return { id, lat: location.lat, lon: location.lng };
            } else {
                throw new Error(`Geocoding API error: ${response.data.status}`);
            }
        });

        return await Promise.all(promises);
    } catch (error) {
        console.error('Error obteniendo coordenadas de aeropuertos:', error);
        throw error;
    }
}

// Función para calcular la distancia entre dos coordenadas
function calculateDistance(coord1, coord2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
    const dLon = (coord2.lon - coord1.lon) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coord1.lat * (Math.PI / 180)) * Math.cos(coord2.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Función para calcular las recomendaciones de vuelos
async function calculateRecommendations(userCoords, flights) {
    const recommendations = [];
    for (const flight of flights) {
        const destinationCoords = await getAirportCoordinates([flight.arrival_airport_id]);
        const distance = calculateDistance(userCoords, destinationCoords[0]);
        const score = distance / flight.price;
        recommendations.push({ flightId: flight.id, score });
    }
    return recommendations;
}

// Función para obtener las 3 mejores recomendaciones
function getTopRecommendations(recommendations) {
    return recommendations.sort((a, b) => a.score - b.score).slice(0, 3);
}

// Procesar trabajos de la cola
recommendationQueue.process(async (job) => {
    const { userIp, userId } = job.data;

    if (!userIp) {
        throw new Error('userIp is required');
    }

    if (!userId) {
        throw new Error('userId is required');
    }

    try {
        // Obtener coordenadas del usuario
        const userCoords = await getUserCoordinates(userIp);

        // Obtener el último vuelo comprado por el usuario
        const lastFlight = await getLastFlight(userId);
        const departureAirport = lastFlight.flight_id;

        // Obtener los 20 vuelos más recientes
        const recentFlights = await getRecentFlights(departureAirport);

        // Calcular las recomendaciones de vuelos
        const recommendations = await calculateRecommendations(userCoords, recentFlights);

        // Obtener las 3 mejores recomendaciones
        const topRecommendations = getTopRecommendations(recommendations);

        return topRecommendations;
    } catch (error) {
        console.error('Error procesando trabajo:', error);
        throw error;
    }
});
