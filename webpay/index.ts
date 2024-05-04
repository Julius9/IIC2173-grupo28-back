import Koa from 'koa';
import logger from 'koa-logger';
import koaBody from 'koa-body';
// import cors
import cors from '@koa/cors';
import { db } from '@utils/db';
// const sequelize = require('./config/config'); // Asegúrate de que la ruta sea correcta


import { router } from './router';

const corsOptions = {
  origin: '*',
  credentials: true,
//  allowMethods: ["GET", "POST", "OPTIONS"],
//  allowHeaders: ["Authorization", "Content-Type", "X-Custom-Header", "Origin", "Accept"]
};

const app = new Koa();

app.use(cors(corsOptions));
app.use(logger());
app.use(koaBody());

app.use(router.routes());

// Conexion a la base de datos
db.connect()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Connected to the PostgreSQL database!');
  })
  .catch((err: any) => {
    // eslint-disable-next-line no-console
    console.error('Unable to connect to the database:', err);
  });



// sequelize.authenticate()
//   .then(() => {
//     // eslint-disable-next-line no-console
//     console.log('Connection has been established successfully.');
//   })
//   .catch((err: any) => {
//     // eslint-disable-next-line no-console
//     console.error('Unable to connect to the database:', err);
//   });

app.listen(3010, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running...');
});
