import { Auxdibot } from '@/interfaces/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import handleLog from '@/util/handleLog';
import { APIEmbed, LogAction, Reaction, ReactionRole } from '@prisma/client';
import { EmbedBuilder, Message } from 'discord.js';
import emojiRegex from 'emoji-regex';
import { Router } from 'express';
/*
   Reaction Roles
   Reaction role endpoints.
*/
type ReactionRoleRequest = { emoji: string; roleID: string };
const reactionRoles = (auxdibot: Auxdibot, router: Router) => {
   router
      .route('/:serverID/reaction_roles')
      .get(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res) => {
            if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
            const serverID = req.params.serverID;
            const guildData = req.user.guilds.find((i) => i.id == serverID);
            const guild = auxdibot.guilds.cache.get(serverID);
            if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
            if (!guildData.owner && !(guildData.permissions & 0x8))
               return res.status(403).json({ error: 'you are not authorized to edit that server' });
            return auxdibot.database.servers
               .findFirst({
                  where: { serverID: serverID },
                  select: {
                     serverID: true,
                     reaction_roles: true,
                  },
               })
               .then(async (data) =>
                  data
                     ? res.json({
                          ...guildData,
                          data,
                       })
                     : res.status(404).json({ error: "couldn't find that server" }),
               )
               .catch((x) => {
                  console.error(x);
                  return res.status(500).json({ error: 'an error occurred' });
               });
         },
      )
      .post(
         (req, res, next) => checkAuthenticated(req, res, next),
         async (req, res) => {
            if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
            if (!req.body['reactions'] || !req.body['channel'])
               return res.status(400).json({ error: 'missing parameters' });
            const serverID = req.params.serverID,
               title = req.body['title'] || 'React to receive roles!';
            const guildData = req.user.guilds.find((i) => i.id == serverID);
            const guild = auxdibot.guilds.cache.get(guildData.id);
            if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
            if (!guildData.owner && !(guildData.permissions & 0x8))
               return res.status(403).json({ error: 'you are not authorized to edit that server' });

            try {
               const reactionsParsed: Array<ReactionRoleRequest> = JSON.parse(
                  req.body['reactions'],
               ) satisfies Array<ReactionRoleRequest>;
               const reactionsAndRoles = await reactionsParsed.reduce(
                  async (acc: Promise<Reaction[]> | Reaction[], item) => {
                     let arr = await acc;
                     const role = await guild.roles.fetch(item.roleID).catch(() => undefined);
                     const emoji = emojiRegex().test(item.emoji) ? item.emoji : undefined;
                     if (role && emoji)
                        arr.length == 0 ? (arr = [{ role: role.id, emoji }]) : arr.push({ role: role.id, emoji });
                     return arr;
                  },
                  [],
               );
               if (reactionsAndRoles.length == 0) return res.status(400).json({ error: 'invalid reactions and roles' });
               const channel = guild.channels.cache.get(req.body['channel']);
               const embed = req.body['embed']
                  ? (JSON.parse(req.body['embed']) satisfies APIEmbed)
                  : new EmbedBuilder()
                       .setColor(auxdibot.colors.reaction_role)
                       .setTitle(title)
                       .setDescription(
                          reactionsAndRoles.reduce(
                             (accumulator: string, item, index) =>
                                `${accumulator}\r\n\r\n> **${index + 1})** ${item.emoji} - <@&${item.role}>`,
                             '',
                          ),
                       )
                       .toJSON();
               if (!channel || !channel.isTextBased()) return res.status(400).json({ error: 'invalid channel' });
               return channel
                  .send({ embeds: embed ? [embed] : undefined, content: req.body['message'] || '' })
                  .then((msg) => {
                     reactionsAndRoles.forEach((i) => msg.react(i.emoji));
                     return auxdibot.database.servers
                        .update({
                           where: { serverID },
                           data: {
                              reaction_roles: {
                                 push: {
                                    messageID: msg.id,
                                    channelID: msg.channel.id,
                                    reactions: reactionsAndRoles,
                                 },
                              },
                           },
                        })
                        .then(() => res.json({ success: 'successfully created a reaction role in ' + channel.name }))
                        .catch(() => res.status(500).json({ error: 'an error occurred' }));
                  })
                  .catch(() => res.status(500).json({ error: 'failed to send embed' }));
            } catch (x) {
               console.log(x);
               return res.status(500).json({ error: 'an error occurred' });
            }
         },
      )
      .delete(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res) => {
            if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
            const serverID = req.params.serverID,
               index = req.body['index'];
            if (typeof index != 'number' && typeof index != 'string')
               return res.status(400).json({ error: 'This is not a valid index!' });
            const guildData = req.user.guilds.find((i) => i.id == serverID);
            const guild = auxdibot.guilds.cache.get(serverID);
            if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
            if (!guildData.owner && !(guildData.permissions & 0x8))
               return res.status(403).json({ error: 'you are not authorized to edit that server' });
            return auxdibot.database.servers
               .findFirst({ where: { serverID: serverID }, select: { reaction_roles: true } })
               .then(async (data) => {
                  if (!data) return res.status(404).json({ error: "couldn't find that server" });
                  if (data.reaction_roles.length < Number(index))
                     return res.status(400).json({ error: 'invalid index provided' });
                  const reactionRole: ReactionRole = data.reaction_roles[index];
                  const channel = auxdibot.channels.cache.get(reactionRole.channelID);
                  const message: Message =
                     channel && channel.isTextBased()
                        ? await channel.messages.fetch(reactionRole.messageID).catch(() => undefined)
                        : undefined;
                  if (message) message.delete();
                  data.reaction_roles.splice(Number(index), 1);
                  await handleLog(auxdibot, guild, {
                     userID: req.user.id,
                     description: `Deleted a reaction role${
                        channel && !channel.isDMBased() ? ` in ${channel.name || 'a channel'}` : ''
                     }.`,
                     type: LogAction.REACTION_ROLE_REMOVED,
                     date_unix: Date.now(),
                  });
                  return await auxdibot.database.servers
                     .update({
                        where: { serverID: serverID },
                        data: { reaction_roles: data.reaction_roles },
                     })
                     .then(() => res.json(reactionRole));
               })
               .catch((x) => {
                  console.error(x);
                  return res.status(500).json({ error: 'an error occurred' });
               });
         },
      );
   return router;
};
export default reactionRoles;
