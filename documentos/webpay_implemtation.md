# Implementacion WebPay

### Flujo:

* En la implementacion de Webpay a la aplicacion se uso `HTTP` donde se enviaban request al ambiente de integracion de `Transbank` para `WebPayPlus` por lo que se usa el host `https://webpay3gint.transbank.cl`, y para esto se realizo un flujo de 3 pasos:

1. Crear Transaccion Aplicacion: Cuando el usuario quiere comprar pasajes de avion se le redirige a una pagina de confirmar su compra, una vez el usuario quiere pagar se crea la transaccion en el endpoint de la aplicacion `/transaction/create`, donde ademas se inicia la transaccion de Webpay.

2. Iniciar Transaccion WebPay: Para crear la transaccion se tiene que llamar al metodo create de WebPayPlus, donde mediante `HTTP` se realiza la siguiente request desde la aplicacion:

    ### Endpoint
    POST -> URL:   `https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions`

    ### Headers

    ```json
    {
        "Tbk-Api-Key-Id": "597055555532",
        "Tbk-Api-Key-Secret": "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
        "Content-Type": "application/json"
    }
    ```
    ### Body

    ```json
    {
    "buy_order": "transactionID",
    "session_id": "test-iic2173",
    "amount": "amount",
    "return_url": "https://frontend/compra-completada"
    }
    ```
    Esto nos da un response donde nos devuelve el `token` de la transaccion y el `URL` donde se realizara el pago.

3. Manejo del pago: Una vez recibidos los parametros del response, se envia un formulario al `URL` recibido con el `token`, donde al usuario se le redirigira a esta URL y podra proceder con el pago, donde Webpay autoriza el pago, lo rechaza, o el usuario cancela el pago.

4. Confirmacion de la transaccion: Una vez hecho el pago se redirecciona a la aplicacion donde esta enviara una peticion a WebPay para obtener la confirmacion de la transaccion mediante el token. Esto se hace mediante el endpoint en la aplicacion `transaction/commit`, donde mediante un request a Webpay se recibe informacion de la transaccion y se manejan los diversos casos segun un `response_code`.

5. Commit Transaccion Webpay: Para obtener informacion de la transaccion se usa la funcion commit de WebPay mediante un request `HTTP` desde la aplicacion:

    ### Endpoint
    PUT -> URL:   `https://webpay3gint.transbank.cl//rswebpaytransaction/api/webpay/v1.2/transactions/{token}`

    ### Headers

    ```json
    {
        "Tbk-Api-Key-Id": "597055555532",
        "Tbk-Api-Key-Secret": "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
        "Content-Type": "application/json"
    }
    ```
    Esto nos da un response donde nos devuelve diversos parametros de la transaccion, la aplicacion solo se preocupara de `response_code`, para saber el status de la transacion y a partir de esto realizar la validacion y otros procesos derivados de la compra de pasajes.