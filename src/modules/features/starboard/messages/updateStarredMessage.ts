import { DEFAULT_STARBOARD_MESSAGE_EMBED } from '@/constants/embeds/DefaultEmbeds';
import { Auxdibot } from '@/Auxdibot';
import parsePlaceholders from '@/util/parsePlaceholder';
import { StarboardBoardData, starred_messages } from '@prisma/client';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, GuildBasedChannel } from 'discord.js';
import { defaultStarLevels } from '@/constants/database/defaultStarLevels';
import { getMessage } from '@/util/getMessage';
import deleteStarredMessage from './deleteStarredMessage';
export default async function updateStarredMessage(
   auxdibot: Auxdibot,
   guild: Guild,
   board: StarboardBoardData,
   starredData: starred_messages,
   count: number,
) {
   // Fetch starred channel from context
   const channel = starredData.starred_channel_id
      ? await guild.channels.fetch(starredData.starred_channel_id)
      : undefined;
   if ((starredData.starred_channel_id && !channel) || !channel.isTextBased()) return;

   // Fetch starboard channel from context
   const board_channel = guild.channels.cache.get(board.channelID);
   if (!board_channel || !board_channel.isTextBased()) return;

   // Fetch starred message and starboard message, if applicable.
   const starredMessage = starredData.starred_channel_id
      ? await channel.messages.fetch(starredData.starred_message_id)
      : await getMessage(guild, starredData.starred_message_id);
   if (!starredMessage) return;

   // Add channel to starred message if it does not exist
   if (!starredData.starred_channel_id) {
      starredData = await auxdibot.database.starred_messages.update({
         where: {
            serverID_board_starred_message_id: {
               serverID: guild.id,
               board: board.board_name,
               starred_message_id: starredData.starred_message_id,
            },
         },
         data: { starred_channel_id: starredMessage.channel.id },
      });
   }
   // Fetch starboard channel
   const starboard_channel: GuildBasedChannel | undefined = await guild.channels
      .fetch(board.channelID)
      .catch(() => undefined);
   if (!starboard_channel || !starboard_channel.isTextBased()) return;

   // Fetch starboard message
   const message = await starboard_channel.messages.fetch(starredData.starboard_message).catch(() => undefined);

   // Get starboard level to use for starboard message
   const starLevelsSorted = board.star_levels.sort((a, b) => b.stars - a.stars);
   const starLevel = starLevelsSorted.find((i) => count >= board.count * i.stars) ??
      starLevelsSorted[0] ?? { ...defaultStarLevels[defaultStarLevels.length - 1], message_reaction: board.reaction };

   // Update starboard message
   if (message) {
      try {
         const jsonEmbed = structuredClone(DEFAULT_STARBOARD_MESSAGE_EMBED);
         jsonEmbed.color = starLevel.color;
         const embed = JSON.parse(
            await parsePlaceholders(auxdibot, JSON.stringify(jsonEmbed), {
               guild,
               member: starredMessage.author,
               starred_data: starredData,
            }),
         );

         // Handle references, quotes, attachments.
         const reference = await starredMessage.fetchReference().catch(() => undefined);

         const quoteEmbed = reference
            ? new EmbedBuilder()
                 .setTitle('Reply to')
                 .setAuthor({ name: reference.author.tag, iconURL: reference.author.avatarURL({ size: 128 }) })
                 .setDescription(reference.cleanContent)
            : null;

         const attachmentsComponent = new ActionRowBuilder<ButtonBuilder>();
         starredMessage.attachments.forEach((i) =>
            attachmentsComponent.components.length < 5
               ? attachmentsComponent.addComponents(
                    new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(i.name).setEmoji('💬').setURL(i.url),
                 )
               : undefined,
         );

         // Edit message
         const reaction = auxdibot.emojis.cache.get(starLevel.message_reaction) ?? starLevel.message_reaction;
         await message.edit({
            content: `**${count} ${reaction ?? ''}** | ${starredMessage.channel}`,
            embeds: [quoteEmbed, embed].filter((i) => i),
            components: [
               new ActionRowBuilder<ButtonBuilder>()
                  .addComponents(
                     new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setLabel('Original Message')
                        .setEmoji('💬')
                        .setURL(
                           `https://discord.com/channels/${starredMessage.guildId}/${starredMessage.channelId}/${starredMessage.id}`,
                        ),
                  )
                  .toJSON(),
               attachmentsComponent.components.length > 0 ? attachmentsComponent : null,
            ].filter((i) => i),
            files: Array.from(starredMessage.attachments.values()),
         });
      } catch (x) {
         console.error(x);
      }
   } else {
      await deleteStarredMessage(auxdibot, guild, starredData).catch(() => undefined);
   }
}
