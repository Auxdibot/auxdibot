import Limits from '@/constants/database/Limits';
import { DEFAULT_STARBOARD_MESSAGE_EMBED } from '@/constants/embeds/DefaultEmbeds';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import parsePlaceholders from '@/util/parsePlaceholder';
import {
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
   EmbedBuilder,
   MessageReaction,
   PartialMessageReaction,
} from 'discord.js';

export default async function createStarredMessage(
   auxdibot: Auxdibot,
   messageReaction: MessageReaction | PartialMessageReaction,
) {
   const server = await findOrCreateServer(auxdibot, messageReaction.message.guild.id);
   const starboard_channel = messageReaction.message.guild.channels.cache.get(server.starboard_channel);
   const starCount =
      (await messageReaction.message.reactions.cache.get(server.starboard_reaction)?.fetch())?.count || 0;
   if (!starboard_channel.isTextBased()) return;
   try {
      if (server.starred_messages.find((i) => i.starred_message_id == messageReaction.message.id)) return;
      const embed = JSON.parse(
         await parsePlaceholders(
            auxdibot,
            JSON.stringify(DEFAULT_STARBOARD_MESSAGE_EMBED),
            messageReaction.message.guild,
            undefined,
            undefined,
            messageReaction.message,
         ),
      );
      const reference = await messageReaction.message.fetchReference().catch(() => undefined);
      const quoteEmbed = reference
         ? new EmbedBuilder()
              .setTitle('Reply to')
              .setAuthor({ name: reference.author.tag, iconURL: reference.author.avatarURL({ size: 128 }) })
              .setDescription(reference.cleanContent)
         : null;
      const attachmentsComponent = new ActionRowBuilder<ButtonBuilder>();
      messageReaction.message.attachments.forEach((i) =>
         attachmentsComponent.components.length < 5
            ? attachmentsComponent.addComponents(
                 new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(i.name).setEmoji('📁').setURL(i.url),
              )
            : undefined,
      );
      if (server.starred_messages.length < Limits.ACTIVE_STARRED_MESSAGES_DEFAULT_LIMIT) {
         const components = [
            new ActionRowBuilder<ButtonBuilder>()
               .addComponents(
                  new ButtonBuilder()
                     .setStyle(ButtonStyle.Link)
                     .setLabel('Original Message')
                     .setEmoji('💬')
                     .setURL(
                        `https://discord.com/channels/${messageReaction.message.guildId}/${messageReaction.message.channelId}/${messageReaction.message.id}`,
                     ),
               )
               .toJSON(),
         ];
         if (attachmentsComponent.components.length > 0) components.push(attachmentsComponent.toJSON());
         const message = await starboard_channel.send({
            content: `**${starCount} ${server.starboard_reaction || 'No Emoji'}** | ${messageReaction.message.channel}`,
            embeds: [quoteEmbed, embed].filter((i) => i),
            ...(components?.length > 0 ? { components } : {}),
            files: Array.from(messageReaction.message.attachments.values()),
         });
         server.starred_messages.push({
            starboard_message_id: message.id,
            starred_message_id: messageReaction.message.id,
         });
         await auxdibot.database.servers
            .update({
               where: { serverID: messageReaction.message.guild.id },
               data: { starred_messages: server.starred_messages, total_starred_messages: { increment: 1 } },
            })
            .catch(() => message.delete());
      }
   } catch (x) {
      console.log(x);
   }
}
