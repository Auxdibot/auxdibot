import Limits from '@/constants/database/Limits';
import { defaultStarLevels } from '@/constants/database/defaultStarLevels';
import { DEFAULT_STARBOARD_MESSAGE_EMBED } from '@/constants/embeds/DefaultEmbeds';
import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import parsePlaceholders from '@/util/parsePlaceholder';
import { StarboardBoardData } from '@prisma/client';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, Message, PartialMessage } from 'discord.js';
import awardXP from '../../levels/awardXP';
import { sendLevelMessage } from '@/util/sendLevelMessage';
import { grantLevelRewards } from '../../levels/grantLevelRewards';
import { calculateLevel } from '../../levels/calculateLevel';
import { getServerStarboardMessages } from '../getServerStarboardMessages';

export default async function createStarredMessage(
   auxdibot: Auxdibot,
   guild: Guild,
   board: StarboardBoardData,
   starredMessage: Message<boolean> | PartialMessage,
   count: number,
) {
   // Check if the message is already starred and fetch server data
   const server = await findOrCreateServer(auxdibot, guild.id);
   const starredMessages = await getServerStarboardMessages(auxdibot, guild.id, board.board_name, {
      starred_message_id: starredMessage.id,
      board: board.board_name,
   });
   if (starredMessages.length > 0) return;

   // Get starboard channel
   const starboard_channel = await guild.channels.fetch(board.channelID);
   if (!starboard_channel || !starboard_channel.isTextBased()) return;

   // Get starboard level to use for starboard message
   const starLevelsSorted = board.star_levels.sort((a, b) => b.stars - a.stars);
   const starLevel = starLevelsSorted.find((i) => count >= board.count * i.stars) ??
      starLevelsSorted[0] ?? { ...defaultStarLevels[defaultStarLevels.length - 1], message_reaction: board.reaction };

   // Create original starboard message
   let starredData = {
      starboard_message: null,
      serverID: guild.id,
      starred_message_id: starredMessage.id,
      starred_channel_id: starredMessage.channel.id,
      board: board.board_name,
   };

   try {
      // Test limit, splice if necessary
      const starredCount = await auxdibot.database.starred_messages.count({
         where: { serverID: guild.id },
      });
      const limit = await auxdibot.getLimit(Limits.ACTIVE_STARRED_MESSAGES_DEFAULT_LIMIT, guild);
      if (starredCount >= limit) {
         const toDelete = starredCount - limit + 1;
         const sorted = await getServerStarboardMessages(auxdibot, guild.id, undefined, {}, toDelete, { date: 'asc' });
         if (sorted.length > 0)
            await auxdibot.database.logs
               .deleteMany({ where: { serverID: guild.id, id: { in: sorted.map((i) => i.id) } } })
               .catch(() => undefined);
      }

      // Create starboard message
      starredMessage = await starredMessage.fetch();
      const jsonEmbed = structuredClone(DEFAULT_STARBOARD_MESSAGE_EMBED);
      jsonEmbed.color = starLevel.color;

      // Create embed message
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
                 new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(i.name).setEmoji('📁').setURL(i.url),
              )
            : undefined,
      );

      // Provide link to original message
      const components = [
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
      ];

      // add attachments to components
      if (attachmentsComponent.components.length > 0) components.push(attachmentsComponent.toJSON());

      // Send starboard message
      const reaction = auxdibot.emojis.cache.get(starLevel.message_reaction) ?? starLevel.message_reaction;
      const message = await starboard_channel.send({
         content: `**${count} ${reaction ?? ''}** | ${starredMessage.channel}`,
         embeds: [quoteEmbed, embed].filter((i) => i),
         ...(components?.length > 0 ? { components } : {}),
         files: Array.from(starredMessage.attachments.values()),
      });

      starredData.starboard_message = message.id;

      const result = await auxdibot.database.starred_messages
         .create({
            data: starredData,
         })
         .catch(() => undefined);
      if (!result) return;
      auxdibot.database.analytics
         .upsert({
            where: { botID: auxdibot.user.id },
            create: { botID: auxdibot.user.id },
            update: { starred_messages: { increment: 1 } },
         })
         .catch(() => undefined);
      // Award XP to the user who posted the message if applicable
      if (
         !(server.starboard_xp_range[0] == 0 && !server.starboard_xp_range[1]) &&
         starredMessage.member &&
         !starredMessage.member.user.bot
      ) {
         const level = await auxdibot.database.servermembers
            .findFirst({
               where: { serverID: guild.id, userID: starredMessage.member.id },
            })
            .then((memberData) => calculateLevel(memberData.xp))
            .catch(() => undefined);
         const randomValue =
            server.starboard_xp_range[0] +
            (server.starboard_xp_range[1]
               ? Math.floor(Math.random() * (server.starboard_xp_range[1] - server.starboard_xp_range[0] + 1))
               : 0);
         const channelMultiplier = server.channel_multipliers.find((i) => i.id == starredMessage.channel.id);
         const roleMultiplier =
            server.role_multipliers.length > 0
               ? server.role_multipliers.reduce(
                    (acc, i) => (starredMessage.member.roles.cache.has(i.id) ? acc * i.multiplier : acc),
                    1,
                 )
               : 1;
         const newLevel = await awardXP(
            auxdibot,
            starredMessage.guild.id,
            starredMessage.member.id,
            randomValue *
               (channelMultiplier ? channelMultiplier.multiplier : 1) *
               (roleMultiplier || 1) *
               server.global_multiplier,
         );

         if (newLevel && level && newLevel > level) {
            if (!starredMessage.member) return;
            await sendLevelMessage(auxdibot, starredMessage.member, level, newLevel, {
               message: starredMessage,
               textChannel: !starredMessage.channel.isDMBased() && starredMessage.channel,
            }).catch((x) => {
               console.error(x);
            });
            await grantLevelRewards(auxdibot, starredMessage.member, newLevel).catch(() => undefined);
         }
      }
   } catch (x) {
      console.error(x);
   }
}
