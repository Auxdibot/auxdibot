import { Auxdibot } from '@/interfaces/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import { ChannelType } from 'discord.js';
import { Router } from 'express';
/*
   Channels
   View all text channels on the server.
*/
const channels = (auxdibot: Auxdibot, router: Router) => {
   router.get(
      '/:serverID/channels',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID;
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(serverID);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });

         return res.json(
            guild.channels.cache.filter(
               (i) => [ChannelType.GuildText, ChannelType.GuildAnnouncement].indexOf(i.type) != -1,
            ),
         );
      },
   );
   router.get(
      '/:serverID/channels/:channelID',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID,
            channelID = req.params.channelID;
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(serverID);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });
         return res.json(guild.channels.cache.get(channelID));
      },
   );
   return router;
};
export default channels;
