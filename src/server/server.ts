import { Auxdibot } from '@/interfaces/Auxdibot';
import express from 'express';
import http from 'http';
import https from 'https';
import { readFile } from 'fs/promises';
import cors from 'cors';
import { analyticsRoute } from './analytics';
import session from 'express-session';
import { authRoute } from './auth';
import initDiscord from './auth/initDiscord';
import passport from 'passport';
import { serversRoute } from './servers';
import Strategy from 'passport-discord';
import bodyParser from 'body-parser';
import checkAuthenticated from './checkAuthenticated';
export default async function server(auxdibot: Auxdibot) {
   const app = express();

   const corsOrigins = ['https://bot.auxdible.me', 'http://localhost:3000', 'http://192.168.1.154:3000'];

   app.use(cors({ origins: corsOrigins }));
   app.use(bodyParser.urlencoded({ extended: true }));
   app.use(
      session({
         secret: process.env.AUTH_SECRET,
         saveUninitialized: false,
         resave: false,
      }),
   );
   app.use(passport.initialize());
   app.use(passport.session());
   initDiscord();

   passport.serializeUser((user: Strategy.Profile, cb) => {
      return cb(null, {
         ...user,
         guilds: user.guilds
            ?.filter((i) => i.owner || i.permissions & 0x8)
            .map((guild) => ({ ...guild, inServer: auxdibot.guilds.cache.get(guild.id) ? true : false })),
      });
   });
   passport.deserializeUser((user: Strategy.Profile, cb) => {
      return cb(null, user);
   });

   app.use('/analytics', analyticsRoute(auxdibot));
   app.use('/auth', authRoute());
   app.use('/servers', serversRoute(auxdibot));
   app.get(
      '/user',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         const id = req.query['id'];
         return auxdibot.users
            .fetch(id.toString())
            .then((user) => res.json(user))
            .catch(() => res.status(404).json(undefined));
      },
   );
   const port = 1080;

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
