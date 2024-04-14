# Consideraciones Generales

En primer lugar, respecto al archivo de configuración de NGINX, se incluye el archivo `api.conf` que se utiliza para la configuración de NGINX en el sitio. Se me otorgó un archivo `.cer` como llave para la instancia, pensé que se trataba de un error pero investigando descubrí que es otro formato válido y me funcionó sin problemas.

**Nombre del dominio:** marniairlines.me
**Dirección IP** 18.235.201.57

## Método de acceso al servidor

Ejecutando el comando `ssh -i "test.cer" ubuntu@ec2-18-235-201-57.compute-1.amazonaws.com` con la terminal abierta en la carpeta que contiene el archivo `test.cer`.

## Puntos logrados o no logrados

### Requisitos funcionales

- RF1 al RF4: Se ve feo y desordenado pero hasta donde yo probé, los 4 requisitos funcionales están implementados.

### Requisitos no funcionales

- RNF1: Logrado. Se implementa un cliente MQTT que escucha constantemente al broker y que corre en un contenedor separado de la base de datos y de la API.
- RNF2: Logrado. Configuré un proxy inverso con NGINX.
- RNF3: Logrado.
- RNF4: Logrado.
- RNF5: Logrado. Se cuenta con una base de datos Postgres que corre en un contenedor.
- RNF6: Logrado. El servicio API Web se encuentra en un contenedor.

## Docker-Compose

Todos los requisitos cumplidos, la API, BDD y receptor MQTT funcionan de manera independiente en contenedores Docker, fueron iniciados con Docker-Compose.

## HTTPS

Todos los requisitos cumplidos. La comprobación automática se configuró con crontab, ejecutando el comando `certbot renew` a las 6 y 18 horas. En teoría este comando revisa cuánto queda de certificado y se renueva solo cuando está a punto de expirar.
