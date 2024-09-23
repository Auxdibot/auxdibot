import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import createNotification from '@/modules/features/notifications/createNotification';
import handleError from '@/util/handleError';
import { APIEmbed, ChannelType, EmbedBuilder } from 'discord.js';

export const notificationsTwitch = <AuxdibotSubcommand>{
   name: 'twitch',
   info: {
      module: Modules['Messages'],
      description: 'Listen for streams on Twitch using Auxdibot.',
      usageExample: '/notifications twitch (channel) (username) [...embed parameters]',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', true, [
         ChannelType.GuildText,
         ChannelType.GuildAnnouncement,
      ]);
      const username = interaction.options.getString('username', true);
      const id = interaction.options.getString('id', true);
      const stored = interaction.data.guildData.stored_embeds.find((i) => i.id === id);
      if (!stored) return handleError(auxdibot, 'EMBED_NOT_FOUND', 'Embed not found!', interaction);
      const { content, embed } = stored;
      try {
         return await createNotification(
            auxdibot,
            interaction.guild,
            channel,
            username,
            content || embed
               ? {
                    content: content?.replace(/\\n/g, '\n'),
                    embed: embed as APIEmbed,
                 }
               : {
                    content: '> 🎦 Twitch Stream Online\n\n{%FEED_LINK%}',
                    embed: null,
                 },
            'TWITCH',
            interaction.user.id,
         ).then(async () => {
            const description = `Created a new notification feed for the Twitch channel \`${username}\`.`;

            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '📬 Created Notification Feed';
            embed.description = description;
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         });
      } catch (x) {
         return await handleError(
            auxdibot,
            'NOTIFICATION_CREATE_ERROR',
            typeof x == 'object' && 'message' in x && typeof x.message == 'string'
               ? x?.message
               : 'Failed to create that notification!',
            interaction,
         );
      }
   },
};
