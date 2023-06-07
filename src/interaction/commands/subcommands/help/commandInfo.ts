import Modules from '@/constants/bot/commands/Modules';
import { promoRow } from '@/constants/bot/promoRow';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { BaseAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const commandInfo = <AuxdibotSubcommand>{
   name: 'command',
   info: {
      module: Modules['General'],
      description: "View a command or subcommand's usage and description.",
      usageExample: '/help command (command) [subcommand]',
      allowedDefault: true,
      permission: 'commands.help.command',
      dmableCommand: true,
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<BaseAuxdibotCommandData>) {
      const command_name = interaction.options.getString('command_name', true),
         subcommand_name = interaction.options.getString('subcommand_name');
      const command = auxdibot.commands.get(command_name);
      const subcommand =
         subcommand_name && command && command.subcommands
            ? command.subcommands.filter((subcommand) => subcommand.name == subcommand_name)[0]
            : undefined;
      const info = subcommand ? subcommand.info : command ? command.info : undefined;
      if (!info) {
         return await handleError(
            auxdibot,
            'COMMAND_NOT_FOUND',
            "Couldn't find that command or subcommand!",
            interaction,
         );
      }

      const helpCommandEmbed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      helpCommandEmbed.title = `❔ /${command.data.name} ${subcommand ? subcommand.name : ''}`;
      helpCommandEmbed.author = {
         name: `Category: ${info.module.name}`,
      };
      helpCommandEmbed.fields = [
         {
            name: 'Command Info',
            value: `${info.description}`,
         },
         {
            name: 'Usage',
            value: `\`${info.usageExample}\``,
         },
      ];
      helpCommandEmbed.footer = {
         text: `Permission: ${info.permission}`,
      };
      return await interaction.reply({
         embeds: [helpCommandEmbed],
         components: [promoRow.toJSON()],
      });
   },
};
