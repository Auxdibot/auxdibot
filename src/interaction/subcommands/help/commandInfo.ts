import Modules from '@/constants/bot/commands/Modules';
import { promoRow } from '@/constants/bot/promoRow';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { BaseAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import { groupBy } from 'lodash';
import { EmbedBuilder } from '@discordjs/builders';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { CustomEmojis } from '@/constants/bot/CustomEmojis';

const subcommandToBrief = (command: AuxdibotCommand, group: string, sub: AuxdibotSubcommand) =>
   `\n\n> **/${command.data.name}${group != 'undefined' ? ` ${group}` : ''}${sub ? ` ${sub.name}` : ''}\n${
      sub.info.dmableCommand ? '💬 DMs' : ''
   } ${command.info.allowedDefault ? '✅ Allowed by default' : ''}\n*${sub.info.description}*\n\`Usage: ${
      sub.info.usageExample
   }\``;

export const commandInfo = <AuxdibotSubcommand>{
   name: 'command',
   info: {
      module: Modules['General'],
      description: "View a command or subcommand's usage and description.",
      usageExample: '/help command (command) [subcommand]',
      allowedDefault: true,
      dmableCommand: true,
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<BaseAuxdibotCommandData>) {
      const command_name = interaction.options.getString('command_name', true);
      const command = auxdibot.commands.get(command_name);
      if (!command) {
         return await handleError(
            auxdibot,
            'COMMAND_NOT_FOUND',
            "Couldn't find that command or subcommand!",
            interaction,
         );
      }
      const subcommands = groupBy(command.subcommands, (sub) => sub.group);

      const helpCommandEmbed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      helpCommandEmbed.title = `❔ /${command.data.name} Info`;
      helpCommandEmbed.description = `${command.info.description}\n\n\**Usage**: \`${command.info.usageExample}\`\n${
         command.info.dmableCommand ? '\n💬 This command can be used in DMs' : ''
      }${command.info.allowedDefault ? '\n✅ This command is allowed by default.' : ''}${
         subcommands['undefined']
            ? subcommands['undefined'].reduce(
                 (acc, b) => acc + subcommandToBrief(command, 'undefined', b),
                 `\n\n${CustomEmojis.DOCS} **Subcommands**`,
              )
            : ''
      }`;
      helpCommandEmbed.fields = Object.keys(subcommands)
         .sort((a, b) => subcommands[a].length - subcommands[b].length)
         .filter((a) => a != 'undefined')
         .map((i) => ({
            name: `${CustomEmojis.DOCS} /${command.data.name} ${i} | Command Group`,
            value: subcommands[i].reduce((acc, b) => acc + subcommandToBrief(command, i, b), ''),
            inline: true,
         }));
      return await auxdibot.createReply(interaction, {
         embeds: [helpCommandEmbed],
         components: [promoRow.toJSON()],
      });
   },
};
