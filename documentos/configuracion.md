## Pasos a seguir para testeo local

Componer los containers para el backend, utilizando el siguiente codigo

`docker compose up --build -d`

Este codigo hace el build y luego levanta los contenedores, ademas se asegura que la terminal no se quede congelada

Con esto:

1. El Archivo de python que escucha al servidor mqtt se queda ejecutando mientras escucha los vuelos entrantes
2. la api de autentificacion se lanza en http://localhost:3003
3. la api de informacion de los vuelos se lanza en http://localhost:3000

Para acceder a la base de datos postges en el docker, se debe correr el siguiente codigo:

`docker compose run database psql -h database -U postgres`

La api de autentificacion tiene las siguientes rutas:

1. POST: http://localhost:3003/api/auth/register

el cual recibe un json con los siguientes parametros y al ejecutarse crea un usuario en la base de datos

`{
  "mail": "julio@gmail.com",
  "username": "julio5",
  "password": "IIC2173"
}`

2. POST: http://localhost:3003/api/auth/login

el cual recibe un json con los siguientes parametros y al ejecutarse correctamente retorna un JWT

`{
  "mail": "julio@uc.com",
  "password": "IIC2173"
}


La api de vuelos tiene las siguientes rutas:

1. GET: http://localhost:3000/flights

Retorna una lista de todos los vuelos guardados en la base de datos

2. POST: http://localhost:3000/flights

Crea una nueva fila en la base de datos de los vuelos, es necesario pasarle los argumentos necesarios. Esto se maneja adecuadamente en el archivo `flights_mqtt_request_validation.js` y con el programa python del brokers

3. GET: http://localhost:3000/flights/:id

Recibe la informacion especifica de un vuelo

4. GET: http://localhost:3000/compras

Por medio del token se recibe el id del usuario, con esto retorna un listo de todos los vuelos que ha podido comprar con exito

5. POST: http://localhost:3000/flights/:id/reservar

Con esto se solicita una reserva a los vuelos, si todo es correcto, luego se ejecuta la compra


Es importante mencioanr que para todas estas rutas (con excepcion del numero 2) se debe pasar en header del request el token del usuario en el siguiente formato:

`Authorization: Bearer <Token>`



