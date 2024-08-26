import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import {
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
   ChannelSelectMenuBuilder,
   ChannelType,
   EmbedBuilder,
   MessageComponentInteraction,
} from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleError from '@/util/handleError';
import { CustomEmojis } from '@/constants/bot/CustomEmojis';

export default <AuxdibotButton>{
   module: Modules['Messages'],
   name: 'post',
   command: 'embed build',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      const [, id] = interaction.customId.split('-');
      const session = auxdibot.build_sessions.get(
         `${interaction.guildId}:${interaction.channelId}:${interaction.message.id}`,
      );
      if (!session) {
         return handleError(
            auxdibot,
            'SESSION_INACTIVE',
            'This session has gone inactive! Run the /embed build command to start a new session.\n\n*By default, sessions will go inactive after 5 minutes.*',
            interaction,
         );
      }
      if (session.userID !== interaction.user.id) {
         return handleError(
            auxdibot,
            'SESSION_USER_MISMATCH',
            'This session was started by another user!',
            interaction,
         );
      }
      if (session?.embed?.fields?.length >= 25) {
         return handleError(
            auxdibot,
            'FIELD_LIMIT_REACHED',
            'You have reached the maximum number of fields for this embed!',
            interaction,
         );
      }
      const postEmbed = new EmbedBuilder()
         .setColor(auxdibot.colors.denied)
         .setTitle(`${CustomEmojis.MESSAGES} Post Embed`)
         .setDescription('Where would you like this embed to be posted to?')
         .setColor(auxdibot.colors.info);
      const channelRow = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
         new ChannelSelectMenuBuilder()
            .addChannelTypes(ChannelType.GuildAnnouncement, ChannelType.GuildText)
            .setCustomId(`post-${id}`)
            .setMaxValues(1)
            .setPlaceholder('What channel would you like this embed to be posted to?'),
      );
      const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
         new ButtonBuilder().setCustomId(`back-${id}`).setLabel('Go Back').setStyle(ButtonStyle.Danger),
         new ButtonBuilder()
            .setCustomId(`edit-${id}`)
            .setLabel('Add to Existing Message')
            .setStyle(ButtonStyle.Secondary),
      );
      interaction.message
         .edit({
            content: '',
            embeds: [postEmbed],
            components: [buttonRow, channelRow],
         })
         .catch(() => undefined);
      return interaction
         .deferReply()
         .then(() => interaction.deleteReply())
         .catch(() => undefined);
   },
};
