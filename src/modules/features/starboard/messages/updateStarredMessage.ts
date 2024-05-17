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

export default async function updateStarredMessage(
   auxdibot: Auxdibot,
   messageReaction: MessageReaction | PartialMessageReaction,
) {
   const server = await findOrCreateServer(auxdibot, messageReaction.message.guild.id);
   const starred = server.starred_messages.find((i) => i.starred_message_id == messageReaction.message.id);
   if (!starred) return;
   const starboard_channel = messageReaction.message.guild.channels.cache.get(server.starboard_channel);
   if (!starboard_channel.isTextBased()) return;
   const starCount =
      (await messageReaction.message.reactions.cache.get(server.starboard_reaction)?.fetch())?.count || 0;
   const message = starboard_channel.messages.cache.get(starred.starboard_message_id);
   if (message) {
      try {
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
                    new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(i.name).setEmoji('💬').setURL(i.url),
                 )
               : undefined,
         );
         await message.edit({
            content: `**${starCount} ${server.starboard_reaction || 'No Emoji'}** | ${messageReaction.message.channel}`,
            embeds: [quoteEmbed, embed].filter((i) => i),
            components: [
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
               attachmentsComponent.components.length > 0 ? attachmentsComponent : null,
            ],
            files: Array.from(messageReaction.message.attachments.values()),
         });
      } catch (x) {}
   }
}
