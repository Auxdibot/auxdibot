import Modules from '@/constants/bot/commands/Modules';
import Placeholders from '@/constants/bot/placeholders/Placeholders';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { DMAuxdibotCommandData, GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

export const placeholdersList = <AuxdibotSubcommand>{
   name: 'placeholders',
   info: {
      module: Modules['General'],
      description: "View Auxdibot's placeholders.",
      usageExample: '/help placeholders',
      allowedDefault: true,
      permission: 'commands.help.placeholders',
      dmableCommand: true,
   },
   async execute(
      auxdibot: Auxdibot,
      interaction: AuxdibotCommandInteraction<DMAuxdibotCommandData | GuildAuxdibotCommandData>,
   ) {
      const placeholdersEmbed = new EmbedBuilder().setColor(auxdibot.colors.default).toJSON();
      placeholdersEmbed.title = '🔁 Placeholders';
      placeholdersEmbed.description =
         'Placeholders can be used in **ANY** Auxdibot command that sends a message! Try out /embed /join or /leave!';
      placeholdersEmbed.fields = [
         {
            name: 'Server',
            value: Object.keys(Placeholders)
               .filter((key) => /^server_/.test(key))
               .reduce((accumulator, key) => `${accumulator}\r\n\`%${key}%\``, ''),
         },
         {
            name: 'Member',
            value: Object.keys(Placeholders)
               .filter((key) => /^member_/.test(key))
               .reduce((accumulator, key) => `${accumulator}\r\n\`%${key}%\``, ''),
         },
         {
            name: 'Message',
            value: Object.keys(Placeholders)
               .filter((key) => /^message_/.test(key))
               .reduce((accumulator, key) => `${accumulator}\r\n\`%${key}%\``, ''),
         },
      ];
      return await interaction.reply({
         embeds: [placeholdersEmbed],
      });
   },
};
