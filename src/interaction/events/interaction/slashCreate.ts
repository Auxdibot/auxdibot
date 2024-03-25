import { EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { DMAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { testCommandPermission } from '@/util/testPermission';
import handleError from '@/util/handleError';

export default async function slashCreate(auxdibot: Auxdibot, interaction: ChatInputCommandInteraction) {
   if (!auxdibot.commands) return;
   const command = auxdibot.commands.get(interaction.commandName);
   if (!command) return;

   const interactionData: AuxdibotCommandInteraction<GuildAuxdibotCommandData | DMAuxdibotCommandData> = interaction;
   const server = interaction.guild ? await findOrCreateServer(auxdibot, interaction.guild.id) : undefined;
   if (!interaction.guild) {
      if (!command.info.dmableCommand) {
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

   const commandData =
      command.subcommands?.find(
         (subcommand) =>
            subcommand.name == interaction.options.getSubcommand() &&
            subcommand.group == interaction.options.getSubcommandGroup(),
      ) || command;
   if (server && server.disabled_modules.find((item) => item == commandData.info.module.name))
      return await auxdibot.createReply(interaction, { embeds: [auxdibot.embeds.disabled.toJSON()] });
   if (interaction.guild) {
      interactionData.data = <GuildAuxdibotCommandData>{
         dmCommand: false,
         date: new Date(),
         guild: interaction.guild,
         member: await interaction.guild.members.fetch(interaction.member.user.id).catch(() => undefined),
         guildData: server,
      };
      const permissionTest = await testCommandPermission(
         auxdibot,
         interaction,
         interaction.commandName,
         [interaction.options.getSubcommandGroup(), interaction.options.getSubcommand()].filter((i) => i),
      );
      console.log(permissionTest);
      if (permissionTest !== true) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title =
            permissionTest == 'noperm'
               ? '⛔ No Permission!'
               : permissionTest == 'notfound'
               ? '❓ Command Not Found!'
               : permissionTest == 'disabled'
               ? '🚫 Disabled'
               : '⛔ Nope!';
         noPermissionEmbed.description =
            permissionTest == 'noperm'
               ? `You do not have permission to use this command.`
               : permissionTest == 'notfound'
               ? `This command is not found.`
               : permissionTest == 'disabled'
               ? `This command is disabled.`
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
