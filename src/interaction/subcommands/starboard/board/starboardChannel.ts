import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setStarboardChannel from '@/modules/features/starboard/boards/setStarboardChannel';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord.js';

export const starboardChannel = <AuxdibotSubcommand>{
   name: 'channel',
   group: 'board',
   info: {
      module: Modules['Starboard'],
      description: 'Set the channel for a starboard on your server.',
      usageExample: '/starboard board channel (name) (channel)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', true, [
            ChannelType.GuildText,
            ChannelType.GuildAnnouncement,
         ]),
         boardName = interaction.options.getString('name', true);

      setStarboardChannel(auxdibot, interaction.guild, interaction.user, boardName, channel)
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '⚙️ Starboard Channel Changed';
            embed.description = `The channel for the board \`${boardName}\` has been updated to ${channel}`;

            return await auxdibot.createReply(interaction, {
               embeds: [embed],
            });
         })
         .catch((x) => handleError(auxdibot, 'STARBOARD_CHANNEL_CHANGE_ERROR', x, interaction));
   },
};
