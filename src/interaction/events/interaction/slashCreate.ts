import { EmbedBuilder, ChatInputCommandInteraction, GuildMember, PermissionsBitField } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { DMAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { testCommandPermission } from '@/util/testCommandPermission';
import handleError from '@/util/handleError';

export default async function slashCreate(auxdibot: Auxdibot, interaction: ChatInputCommandInteraction) {
   if (!auxdibot.commands) return;
   const command = auxdibot.commands.get(interaction.commandName);
   if (!command) return;

   const interactionData: AuxdibotCommandInteraction<GuildAuxdibotCommandData | DMAuxdibotCommandData> = interaction;
   const server = interaction.guild ? await findOrCreateServer(auxdibot, interaction.guild.id) : undefined;

   const subcommandArgs = [
      interaction.options.getSubcommandGroup(false),
      interaction.options.getSubcommand(false),
   ].filter((i) => i);

   let commandData =
      command.subcommands?.find((subcommand) =>
         subcommand && subcommandArgs.length > 1
            ? subcommand.name == subcommandArgs[1] && subcommand.group == subcommandArgs[0]
            : subcommand.name == subcommandArgs[0] && subcommand.group == null,
      ) || command;
   if (commandData) {
      commandData = {
         ...commandData,
         info: {
            ...command.info,
            ...commandData.info,
         },
      };
   }
   if (!interaction.guild) {
      if (!commandData.info.global) {
         const discordServerOnlyEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         discordServerOnlyEmbed.title = '⛔ Nope!';
         discordServerOnlyEmbed.description = `This command can only be used in Discord Servers!`;
         return await auxdibot.createReply(interaction, {
            embeds: [discordServerOnlyEmbed],
         });
      }
      interactionData.data = <DMAuxdibotCommandData>{
         dmCommand: true,
         date: new Date(),
         user: interaction.user,
      };
   }
   if (server && server.disabled_modules.find((item) => item == commandData.info.module.name))
      return await auxdibot.createReply(interaction, { embeds: [auxdibot.embeds.disabled.toJSON()] });
   if (interaction.guild) {
      const member: GuildMember | undefined = await interaction.guild.members
         .fetch(interaction.member.user.id)
         .catch(() => undefined);
      if (
         (!member.permissions.has(PermissionsBitField.Flags.Administrator) || member.id != member.guild.ownerId) &&
         server.commands_channel &&
         server.commands_channel != interaction.channelId
      ) {
         const channelOnlyEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         channelOnlyEmbed.title = '⛔ Nope!';
         channelOnlyEmbed.description = `Auxdibot commands are restricted to the channel: <#${server.commands_channel}>`;
         return await auxdibot.createReply(interaction, {
            embeds: [channelOnlyEmbed],
            ephemeral: true,
         });
      }
      interactionData.data = <GuildAuxdibotCommandData>{
         dmCommand: false,
         date: new Date(),
         guild: interaction.guild,
         member,
         guildData: server,
      };
      const permissionTest = await testCommandPermission(
         auxdibot,
         interaction,
         interaction.guildId,
         interaction.commandName,
         subcommandArgs,
      );
      if (permissionTest !== true) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ Permission Denied';
         noPermissionEmbed.description = permissionTest.toString().includes('noperm')
            ? `You do not have permission to use this command. ${
                 permissionTest.toString().includes('-')
                    ? ` (Missing Permission: \`${permissionTest.toString().split('-')[1]}\`)`
                    : ''
              }`
            : permissionTest == 'notfound'
            ? `This command is not found.`
            : permissionTest == 'disabled'
            ? `This command is disabled.`
            : permissionTest == 'noperm-channel'
            ? `You do not have permission to use this command in this channel.`
            : `This command is not available in this server.`;
         return await auxdibot.createReply(interaction, {
            ephemeral: true,
            embeds: [noPermissionEmbed],
         });
      }
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
