import { Auxdibot } from '@/interfaces/Auxdibot';
import { ReactionRoleType } from '@prisma/client';
import { Channel, EmbedBuilder, Guild, APIEmbed, WebhookClient, ChannelType } from 'discord.js';
import { parseReactionsAndRoles } from './parseReactionsAndRoles';
import applyReactionRoles from './applyReactionRoles';

export default async function addReactionRole(
   auxdibot: Auxdibot,
   guild: Guild,
   channel: Channel,
   title: string,
   reactions: {
      emoji: string;
      roleID: string;
   }[],
   embed?: APIEmbed,
   content?: string,
   type?: ReactionRoleType,
   webhook_url?: string,
) {
   if (['DEFAULT', 'STICKY_SELECT_ONE', 'STICKY', 'SELECT_ONE'].indexOf(type) == -1 && webhook_url) {
      throw new Error('Webhooks are only supported for default reaction roles!');
   }

   const reactionsAndRoles = await parseReactionsAndRoles(auxdibot, guild, reactions);
   if (reactionsAndRoles.length == 0) throw new Error('invalid reactions and roles');
   for (const reaction of reactionsAndRoles) {
      if (!reaction.role) throw new Error('invalid role given for reaction role');
      if (!reaction.emoji) throw new Error('invalid emoji given for reaction role');
   }
   if (!channel || channel.type != ChannelType.GuildText) throw new Error('invalid channel');
   let message = null;
   if (webhook_url && !channel.isDMBased()) {
      if (!webhook_url.startsWith('https://discord.com/api/webhooks/')) throw new Error('Invalid Webhook URL!');
      const webhooks = await channel.fetchWebhooks().catch(() => {
         throw new Error('Auxdibot does not have permission to manage/view Webhooks in this channel!');
      });
      const webhook = webhooks.find((x) => x.url == webhook_url);
      if (!webhook) throw new Error('Invalid Webhook URL!');
      const client = new WebhookClient({ url: webhook_url });
      await client
         .send({
            embeds: embed
               ? [embed]
               : !content
               ? [
                    new EmbedBuilder()
                       .setColor(auxdibot.colors.reaction_role)
                       .setTitle(title)
                       .setDescription(
                          reactionsAndRoles.reduce(
                             (accumulator: string, item, index) =>
                                `${accumulator}\r\n\r\n> **${index + 1})** ${
                                   auxdibot.emojis.cache.get(item.emoji) || item.emoji
                                } - ${item.role}`,
                             '',
                          ),
                       )
                       .toJSON(),
                 ]
               : [],
            content: content || '',
         })
         .then(async (msg) => {
            message = msg;
            applyReactionRoles(msg.id, channel, reactionsAndRoles, type);
         });
   } else {
      await channel
         .send({
            embeds: embed
               ? [embed]
               : !content
               ? [
                    new EmbedBuilder()
                       .setColor(auxdibot.colors.reaction_role)
                       .setTitle(title)
                       .setDescription(
                          reactionsAndRoles.reduce(
                             (accumulator: string, item, index) =>
                                `${accumulator}\r\n\r\n> **${index + 1})** ${
                                   auxdibot.emojis.cache.get(item.emoji) || item.emoji
                                } - ${item.role}`,
                             '',
                          ),
                       )
                       .toJSON(),
                 ]
               : [],
            content: content || '',
         })
         .then(async (msg) => {
            message = msg;
            applyReactionRoles(msg.id, channel, reactionsAndRoles, type);
         })
         .catch((x) => {
            if (message) message.delete().catch(() => undefined);
            if (x.code == '50013') throw new Error('Auxdibot does not have permission to send messages!');
            throw new Error('failed to send embed');
         });
   }

   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: {
            reaction_roles: {
               push: {
                  messageID: message.id,
                  channelID: channel.id,
                  type,
                  reactions: reactionsAndRoles.map((i) => ({ role: i.role.id, emoji: i.emoji })),
               },
            },
         },
      })
      .then(() => true);
}
