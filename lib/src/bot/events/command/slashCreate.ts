import { EmbedBuilder, GuildMember, ChatInputCommandInteraction } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { DMAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import testPermission from '@/util/testPermission';

export default async function slashCreate(auxdibot: Auxdibot, interaction: ChatInputCommandInteraction) {
   if (!auxdibot.commands) return;
   const command = auxdibot.commands.get(interaction.commandName);
   if (!command) return;
   if (interaction.guild && interaction.member) {
      const interactionData: AuxdibotCommandInteraction<GuildAuxdibotCommandData> = interaction;
      const server = await findOrCreateServer(auxdibot, interaction.guild.id);
      interactionData.data = <GuildAuxdibotCommandData>{
         dmCommand: false,
         date: new Date(),
         guild: interaction.guild,
         member: interaction.member as GuildMember,
         guildData: server,
      };
      if (command.subcommands) {
         const subcommand = command.subcommands.find(
            (subcommand) => subcommand.name == interaction.options.getSubcommand(),
         );

         if (subcommand) {
            if (server.disabled_modules.find((item) => item == subcommand.info.module.name))
               return await interaction.reply({ embeds: [auxdibot.embeds.disabled.toJSON()] });
            if (
               !(await testPermission(
                  auxdibot,
                  interaction.guild.id,
                  subcommand.info.permission,
                  interactionData.data.member,
                  subcommand.info.allowedDefault || false,
               ))
            ) {
               const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
               noPermissionEmbed.title = '⛔ No Permission!';
               noPermissionEmbed.description = `You do not have permission to use this subcommand. (Missing permission: \`${subcommand.info.permission}\`)`;
               return await interaction.reply({
                  embeds: [noPermissionEmbed],
               });
            }
            return await subcommand.execute(auxdibot, interactionData);
         }
      }
      if (server.disabled_modules.find((item) => item == command.info.module.name))
         return await interaction.reply({ embeds: [auxdibot.embeds.disabled.toJSON()] });
      if (
         !(await testPermission(
            auxdibot,
            interaction.guild.id,
            command.info.permission,
            interactionData.data.member,
            command.info.allowedDefault || false,
         ))
      ) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `You do not have permission to use this command. (Missing permission: \`${command.info.permission}\`)`;
         return await interaction.reply({
            embeds: [noPermissionEmbed],
         });
      }
      return await command.execute(auxdibot, interactionData);
   } else {
      const interactionData: AuxdibotCommandInteraction<DMAuxdibotCommandData> = interaction;
      interactionData.data = <DMAuxdibotCommandData>{
         dmCommand: true,
         date: new Date(),
         user: interaction.user,
      };
      if (!command.info.dmableCommand) {
         const discordServerOnlyEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         discordServerOnlyEmbed.title = '⛔ Nope!';
         discordServerOnlyEmbed.description = `This command can only be used in Discord Servers!`;
         return await interaction.reply({
            embeds: [discordServerOnlyEmbed],
         });
      }
      if (command.subcommands) {
         const subcommand = command.subcommands.find(
            (subcommand) => subcommand.name == interaction.options.getSubcommand(),
         );
         if (subcommand) {
            if (!subcommand.info.dmableCommand) {
               const discordServerOnlyEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
               discordServerOnlyEmbed.title = '⛔ Nope!';
               discordServerOnlyEmbed.description = `This command can only be used in Discord Servers!`;
               return await interaction.reply({
                  embeds: [discordServerOnlyEmbed],
               });
            }
            return await subcommand.execute(auxdibot, interactionData);
         }
      }

      return await command.execute(auxdibot, interactionData);
   }
}
