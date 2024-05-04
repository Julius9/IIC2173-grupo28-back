import Router from 'koa-router';
import { tx } from '@utils/trx';
// import { db } from '@utils/db';
import Flight from '../models/Flight';
import Transaction from '../models/Transaction';



const trxRouter = new Router();

trxRouter.post('/create', async (ctx) => {
  try {
    const { flight_id, quantity, user_id } = ctx.request.body;
    const flight = await Flight.findByPk(flight_id);

    if (!flight) {
      ctx.body = {
        message: "Vuelo no encontrado"
      };
      ctx.status = 404;
      return;
    }
    const amount = flight.price * Number(quantity);
    const newTrx = await Transaction.create({
      flight_id: flight_id,
      user_id: user_id,
      quantity: quantity,
      amount: amount,
      status: "pending"
    });    
    // // USO: tx.create(transactionId, nombreComercio, monto, urlRetorno)
    const trx = await tx.create(newTrx.id, "test-iic2173", amount, process.env?.REDIRECT_URL || "http://localhost:3000");
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