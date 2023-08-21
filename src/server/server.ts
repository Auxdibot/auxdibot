import { Auxdibot } from '@/interfaces/Auxdibot';
import express from 'express';

import http from 'http';
import https from 'https';
import { readFile } from 'fs/promises';
import cors from 'cors';
import { analytics } from './analytics';
export default async function server(auxdibot: Auxdibot) {
   const app = express();
   app.use('/analytics', analytics(auxdibot));
   const corsOrigins = ['https://bot.auxdible.me', 'http://localhost:3000'];

   app.use(cors({ origins: corsOrigins }));
   const port = process.env.EXPRESS_PORT || 1080;

   const server = http.createServer(app);

   server.listen(port, () => {
      console.log(`-> Express server is up at port ${port}`);
   });
   if (process.env.NODE_ENV == 'production') {
      const privkey = await readFile('/etc/letsencrypt/live/bot.auxdible.me/privkey.pem', 'utf8'),
         cert = await readFile('/etc/letsencrypt/live/bot.auxdible.me/cert.pem', 'utf8'),
         chain = await readFile('/etc/letsencrypt/live/bot.auxdible.me/chain.pem', 'utf8');

      const creds = {
         key: privkey,
         cert,
         ca: chain,
      };

      const httpsServer = https.createServer(creds, app);
      httpsServer.listen(1443, () => {
         console.log('-> Express [HTTPS] server is up at port 443');
      });
   } else {
      app.use('/', (req, res, next) => {
         console.log(req.url + ' | ' + req.method);
         next();
      });
   }
}
