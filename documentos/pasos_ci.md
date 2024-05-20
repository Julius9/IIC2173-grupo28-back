## Paso a paso de la configuracion CI para el backend

Mencionar que no alcanzamos a realiar una configuracion CI para el frontend

#### Broker Python

1. Se especifica que maquina virtual se usara para ejecutar el trabajo
2. Se clona el contenido del repositorio en la maquina virtual
3. Se establece la version de python
4. Se verifica si el directorio `brokers` existe, con el objetivo de correr las acciones, si es que no existe el proceso termina aca
5. Se mueve a la carpeta `brokers`
6. Se instala flake8 para hacer el lint
7. Se corre el linter


#### Api de informacion de vuelos

1. Se especifica que maquina virtual se usara para ejecutar el trabajo
2. Se clona el contenido del repositorio en la maquina virtual
3. Se establece la version de Node
4. Se verifica si el directorio `legit_app` existe, con el objetivo de correr las acciones, si es que no existe el proceso termina aca
5. Se mueve a la carpeta `legit_app`
6. corre el instalador de paquetes con npm
7. Se corre el lint con Eslint


#### Api de informacion de vuelos

1. Se especifica que maquina virtual se usara para ejecutar el trabajo
2. Se clona el contenido del repositorio en la maquina virtual
3. Se establece la version de Node
4. Se verifica si el directorio `auth` existe, con el objetivo de correr las acciones, si es que no existe el proceso termina aca
5. Se mueve a la carpeta `auth`
6. corre el instalador de paquetes con npm
7. Se corre el lint con Eslint

