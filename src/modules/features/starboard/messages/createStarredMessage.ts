import Limits from '@/constants/database/Limits';
import { defaultStarLevels } from '@/constants/database/defaultStarLevels';
import { DEFAULT_STARBOARD_MESSAGE_EMBED } from '@/constants/embeds/DefaultEmbeds';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import parsePlaceholders from '@/util/parsePlaceholder';
import { testLimit } from '@/util/testLimit';
import { StarboardBoardData } from '@prisma/client';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, Message, PartialMessage } from 'discord.js';

export default async function createStarredMessage(
   auxdibot: Auxdibot,
   guild: Guild,
   board: StarboardBoardData,
   starredMessage: Message<boolean> | PartialMessage,
   count: number,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   const starboard_channel = guild.channels.cache.get(board.channelID);
   if (!starboard_channel || !starboard_channel.isTextBased()) return;
   const starLevelsSorted = board.star_levels.sort((a, b) => b.stars - a.stars);
   const starLevel = starLevelsSorted.find((i) => count >= board.count * i.stars) ??
      starLevelsSorted[0] ?? { ...defaultStarLevels[defaultStarLevels.length - 1], message_reaction: board.reaction };
   try {
      const jsonEmbed = structuredClone(DEFAULT_STARBOARD_MESSAGE_EMBED);
      jsonEmbed.color = starLevel.color;
      const starredData = {
         starboard_message_id: undefined,
         starred_message_id: starredMessage.id,
         board: board.board_name,
      };
      const embed = JSON.parse(
         await parsePlaceholders(
            auxdibot,
            JSON.stringify(jsonEmbed),
            guild,
            starredMessage.author,
            undefined,
            starredData,
         ),
      );

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

      testLimit(server.starred_messages, Limits.ACTIVE_STARRED_MESSAGES_DEFAULT_LIMIT, true);

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

      if (attachmentsComponent.components.length > 0) components.push(attachmentsComponent.toJSON());
      const reaction = auxdibot.emojis.cache.get(starLevel.message_reaction) ?? starLevel.message_reaction;
      const message = await starboard_channel.send({
         content: `**${count} ${reaction ?? ''}** | ${starredMessage.channel}`,
         embeds: [quoteEmbed, embed].filter((i) => i),
         ...(components?.length > 0 ? { components } : {}),
         files: Array.from(starredMessage.attachments.values()),
      });

      starredData.starboard_message_id = message.id;
      await auxdibot.database.servers
         .update({
            where: { serverID: guild.id },
            data: { starred_messages: { push: starredData } },
         })
         .catch(() => message.delete());
   } catch (x) {
      console.error(x);
   }
}
