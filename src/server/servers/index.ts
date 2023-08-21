import { Auxdibot } from '@/interfaces/Auxdibot';
import express from 'express';
import checkAuthenticated from '../checkAuthenticated';

const router = express.Router();

export const servers = (auxdibot: Auxdibot) => {
   router.get(
      '/',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         return res.json(req.user?.guilds).status(200);
      },
   );
   return router;
};
