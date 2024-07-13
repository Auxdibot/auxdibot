import { DEFAULT_STARBOARD_MESSAGE_EMBED } from '@/constants/embeds/DefaultEmbeds';
import { Auxdibot } from '@/interfaces/Auxdibot';
import parsePlaceholders from '@/util/parsePlaceholder';
import { StarboardBoardData, StarredMessage } from '@prisma/client';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, GuildBasedChannel } from 'discord.js';
import { defaultStarLevels } from '@/constants/database/defaultStarLevels';
import { getMessage } from '@/util/getMessage';
export default async function updateStarredMessage(
   auxdibot: Auxdibot,
   guild: Guild,
   board: StarboardBoardData,
   starredData: StarredMessage,
   count: number,
) {
   const starredMessage = await getMessage(guild, starredData.starred_message_id).catch(() => undefined);
   if (!starredMessage) return;
   const starboard_channel: GuildBasedChannel | undefined = await guild.channels
      .fetch(board.channelID)
      .catch(() => undefined);
   if (!starboard_channel || !starboard_channel.isTextBased()) return;
   const message = await starboard_channel.messages.fetch(starredData.starboard_message_id).catch(() => undefined);

   const starLevelsSorted = board.star_levels.sort((a, b) => b.stars - a.stars);
   const starLevel = starLevelsSorted.find((i) => count >= board.count * i.stars) ??
      starLevelsSorted[0] ?? { ...defaultStarLevels[defaultStarLevels.length - 1], message_reaction: board.reaction };

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
   }
}
