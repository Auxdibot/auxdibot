import { Auxdibot } from '@/interfaces/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
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
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         return res.json(
            req.guild.channels.cache.filter(
               (i) => [ChannelType.GuildText, ChannelType.GuildAnnouncement].indexOf(i.type) != -1,
            ),
         );
      },
   );
   router.get(
      '/:serverID/channels/:channelID',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const channelID = req.params.channelID;
         return res.json(req.guild.channels.cache.get(channelID));
      },
   );
   return router;
};
export default channels;
