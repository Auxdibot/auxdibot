import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

export const levelsToggleEmbed = <AuxdibotSubcommand>{
   name: 'toggle_embed',
   info: {
      module: Modules['Levels'],
      description: 'Toggle whether the Level embed is sent upon a user leveling up.',
      usageExample: '/levels toggle_embed',
      permission: 'levels.embed',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      return await auxdibot.database.servers
         .update({
            where: { serverID: interaction.data.guildData.serverID },
            data: { level_embed: !interaction.data.guildData.level_embed },
         })
         .then(async (data) => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).setTitle('Success!').toJSON();
            embed.description = data.level_embed
               ? 'A levelup embed will now be sent when a user levels up in your server.'
               : 'A levelup embed will no longer be sent when a user levels up in your server.';
            return await interaction.reply({ embeds: [embed] });
         });
   },
};
