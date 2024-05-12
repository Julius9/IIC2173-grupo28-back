import Router from 'koa-router';
import { tx } from '@utils/trx';
// import { db } from '@utils/db';
import Flight from '../models/Flight';
import Transaction from '../models/Transaction';
import { where } from 'sequelize';



const trxRouter = new Router();

trxRouter.post('/create', async (ctx) => {
  try {
    const { flight_id, quantity, user_id } = ctx.request.body;
    console.log(ctx.request.body);
    console.log(flight_id, quantity, user_id)


    const flight = await Flight.findByPk(flight_id);

    if (!flight) {
      ctx.body = {
        message: "Vuelo no encontrado"
      };
      ctx.status = 404;
      return;
    }
    const amount = flight.price * Number(quantity);

    console.log("Creando una transaccion");
    console.log(flight_id, quantity, user_id, amount);

    const newTrx = await Transaction.create({
      flight_id: flight_id,
      user_id: user_id,
      quantity: quantity,
      amount: amount,
      status: "pending"
    });

    console.log("Se creo una nueva transaccion");
    const transactionID = newTrx.id.toString();
    // // USO: tx.create(transactionId, nombreComercio, monto, urlRetorno)
    const trx = await tx.create(transactionID, "test-iic2173", amount, process.env?.REDIRECT_URL || "http://localhost:3000/compra-completada");
    await Transaction.update({
      token: trx.token
    }, {
      where: {
        id: newTrx.id
      }
    });    
    ctx.body = trx;
    ctx.status = 201;
  } catch (e) {
    console.log(e);
  }
  return;
});

trxRouter.post('/commit', async (ctx) => {
  const { ws_token } = ctx.request.body;
  if (!ws_token || ws_token == "") {
    ctx.body = {
      message: "Transaccion anulada por el usuario"
    };
    ctx.status = 200;
    return;
  }
  const confirmedTx = await tx.commit(ws_token);

  if (confirmedTx.response_code != 0) { // Rechaza la compra
    const trx = await Transaction.update({
      where: {
        token: ws_token
      },
      data: {
        status: "rejected"
      },
      select: {
        flight_id: true,
        user_id: true,
        quantity: true,
        amount: true
      }
    });
    ctx.body = {
      message: "Transaccion ha sido rechazada",
      flight: trx.flight_id,
      quantity: trx.quantity

    };
    ctx.status = 200;
    return;
  }
  const trx = await Transaction.update({
    where: {
      token: ws_token
    },
    data: {
      status: "completed"
    }, 
    select: {
      flight_id: true,
      user_id: true,
      quantity: true,
      amount: true
    }
    
  });

  ctx.status = 200;
  ctx.body = {
    message: "Transaccion ha sido aceptada",
    flight: trx.flight_id,
    quantity: trx.quantity
  };
  return;
});


export { trxRouter };