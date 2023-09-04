import { Auxdibot } from '@/interfaces/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import handleLog from '@/util/handleLog';
import { APIEmbed, LogAction } from '@prisma/client';
import { Router } from 'express';
/*
   Greetings
   Endpoints to manage sending greetings.
*/
const greetings = (auxdibot: Auxdibot, router: Router) => {
   router.route('/:serverID/greetings/join').post(
      (req, res, next) => checkAuthenticated(req, res, next),
      async (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         if (!req.body['message'] && !req.body['embed']) return res.status(400).json({ error: 'missing parameters' });
         const serverID = req.params.serverID,
            message = req.body['message'];
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(guildData.id);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });

         try {
            const embed = req.body['embed'] ? (JSON.parse(req.body['embed']) satisfies APIEmbed) : undefined;
            return auxdibot.database.servers
               .update({
                  where: { serverID: serverID },
                  data: { join_text: message, join_embed: embed },
                  select: { join_text: true, join_embed: true, serverID: true },
               })
               .then((data) => res.json(data));
         } catch (x) {
            console.log(x);
            return res.status(500).json({ error: 'an error occurred' });
         }
      },
   );
   router.route('/:serverID/greetings/join_DM').post(
      (req, res, next) => checkAuthenticated(req, res, next),
      async (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         if (!req.body['message'] && !req.body['embed']) return res.status(400).json({ error: 'missing parameters' });
         const serverID = req.params.serverID,
            message = req.body['message'];
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(guildData.id);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });

         try {
            const embed = req.body['embed'] ? (JSON.parse(req.body['embed']) satisfies APIEmbed) : undefined;
            return auxdibot.database.servers
               .update({
                  where: { serverID: serverID },
                  data: { join_dm_text: message, join_dm_embed: embed },
                  select: { join_dm_text: true, join_dm_embed: true, serverID: true },
               })
               .then((data) => res.json(data));
         } catch (x) {
            console.log(x);
            return res.status(500).json({ error: 'an error occurred' });
         }
      },
   );
   router.route('/:serverID/greetings/leave').post(
      (req, res, next) => checkAuthenticated(req, res, next),
      async (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         if (!req.body['message'] && !req.body['embed']) return res.status(400).json({ error: 'missing parameters' });
         const serverID = req.params.serverID,
            message = req.body['message'];
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(guildData.id);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });

         try {
            const embed = req.body['embed'] ? (JSON.parse(req.body['embed']) satisfies APIEmbed) : undefined;
            return auxdibot.database.servers
               .update({
                  where: { serverID: serverID },
                  data: { leave_text: message, leave_embed: embed },
                  select: { leave_text: true, leave_embed: true, serverID: true },
               })
               .then((data) => res.json(data));
         } catch (x) {
            console.log(x);
            return res.status(500).json({ error: 'an error occurred' });
         }
      },
   );
   router.post(
      '/:serverID/greetings/channel',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID,
            new_channel = req.body['channel'];
         if (typeof new_channel != 'string' && typeof new_channel != 'undefined')
            return res.status(400).json({ error: 'this is not a valid join/leave channel!' });
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(serverID);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });
         const channel = guild.channels.cache.get(new_channel);
         if (!channel && new_channel) return res.status(404).json({ error: 'invalid channel' });
         return auxdibot.database.servers
            .update({
               where: { serverID },
               select: { join_leave_channel: true, serverID: true },
               data: { join_leave_channel: new_channel },
            })
            .then(async (i) => {
               await handleLog(auxdibot, guild, {
                  type: LogAction.JOIN_LEAVE_CHANNEL_CHANGED,
                  userID: req.user.id,
                  date_unix: Date.now(),
                  description: `The Join/Leave for this server has been changed to ${
                     channel ? `#${channel.name}` : 'none. Join/Leave greetings are now disabled on this server.'
                  }`,
               });
               return i ? res.json({ data: i }) : res.status(500).json({ error: "couldn't update that server" });
            })
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   return router;
};
export default greetings;
