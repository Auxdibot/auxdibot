import { Auxdibot } from '@/Auxdibot';
import { NextFunction, Request, Response } from 'express';

export default function checkGuildOwnership(auxdibot: Auxdibot, req: Request, res: Response, next: NextFunction) {
   if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
   const serverID = req.params.serverID;
   const guildData = req.user.guilds.find((i) => i.id == serverID);
   const guild = auxdibot.guilds.cache.get(serverID);
   if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
   if (!guildData.owner && !(guildData.permissions & 0x8))
      return res.status(403).json({ error: 'you are not authorized to edit that server' });
   req.guildData = guildData;
   req.guild = guild;
   return next();
}
