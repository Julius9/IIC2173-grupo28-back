import Router from 'koa-router';
import { trxRouter } from '@routes/transaction';
import Flight from '@models/Flight';

const router = new Router();

router.use('/transaction', trxRouter.routes());

router.get('/', async (ctx) => {
  console.log("Estoy en la ruta de vuelos");
  const flights = await Flight.findAll();
  console.log("Volví de la base de datos");
  ctx.body = {
    flights
  };
});

export { router }