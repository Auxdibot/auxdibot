import { EmbedBuilder, GuildMember, ChatInputCommandInteraction } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { DMAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import testPermission from '@/util/testPermission';
import handleError from '@/util/handleError';

export default async function slashCreate(auxdibot: Auxdibot, interaction: ChatInputCommandInteraction) {
   if (!auxdibot.commands) return;
   const command = auxdibot.commands.get(interaction.commandName);
   if (!command) return;

   const interactionData: AuxdibotCommandInteraction<GuildAuxdibotCommandData | DMAuxdibotCommandData> = interaction;
   const server = interaction.guild ? await findOrCreateServer(auxdibot, interaction.guild.id) : undefined;
   if (interaction.guild) {
      interactionData.data = <GuildAuxdibotCommandData>{
         dmCommand: false,
         date: new Date(),
         guild: interaction.guild,
         member: interaction.member as GuildMember,
         guildData: server,
      };
   } else if (!interaction.guild) {
      if (!command.info.dmableCommand) {
         const discordServerOnlyEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         discordServerOnlyEmbed.title = '⛔ Nope!';
         discordServerOnlyEmbed.description = `This command can only be used in Discord Servers!`;
         return await interaction.reply({
            embeds: [discordServerOnlyEmbed],
         });
      }
      interactionData.data = <DMAuxdibotCommandData>{
         dmCommand: true,
         date: new Date(),
         user: interaction.user,
      };
   }

   const commandData =
      command.subcommands?.find(
         (subcommand) =>
            subcommand.name == interaction.options.getSubcommand() &&
            subcommand.group == interaction.options.getSubcommandGroup(),
      ) || command;
   if (server && server.disabled_modules.find((item) => item == commandData.info.module.name))
      return await interaction.reply({ embeds: [auxdibot.embeds.disabled.toJSON()] });
   if (
      interaction.guild &&
      !(await testPermission(
         auxdibot,
         interaction.guild.id,
         commandData.info.permission,
         interaction.member as GuildMember,
         commandData.info.allowedDefault || false,
      ))
   ) {
      const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
      noPermissionEmbed.title = '⛔ No Permission!';
      noPermissionEmbed.description = `You do not have permission to use this. (Missing permission: \`${commandData.info.permission}\`)`;
      return await interaction.reply({
         ephemeral: true,
         embeds: [noPermissionEmbed],
      });
   }
   if (!commandData || !commandData.execute)
      return handleError(
         auxdibot,
         'INVALID_COMMAND_OR_SUBCOMMAND',
         'This command is invalid or incomplete! Please report this to our support server.',
         interaction,
      );
   try {
      await commandData.execute(auxdibot, interactionData);
   } catch (x) {
      console.error(x);
      return handleError(
         auxdibot,
         'COMMAND_ERROR',
         'This command has produced an uncaught error! Please report this to our support server.',
         interaction,
      );
   }
}
