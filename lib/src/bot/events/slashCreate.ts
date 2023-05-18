import { BaseInteraction, GuildMember } from 'discord.js';
import { IAuxdibot } from '@util/types/templates/IAuxdibot';
import Embeds from '@util/constants/Embeds';
import Server from '@models/server/Server';
import { DMAuxdibotCommandData } from '@util/types/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@util/types/templates/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@util/types/AuxdibotCommandData';

module.exports = {
   name: 'interactionCreate',
   once: false,
   async execute(interaction: BaseInteraction) {
      const client: IAuxdibot = interaction.client;
      if (!interaction.isChatInputCommand() || !client.commands) return;
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      if (interaction.guild && interaction.member) {
         const interactionData: AuxdibotCommandInteraction<GuildAuxdibotCommandData> = interaction;
         const server = await Server.findOrCreateServer(interaction.guild.id);
         const settings = await server.fetchSettings();
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
            if (settings.disabled_modules.find((item) => item == subcommand.info.module.name))
               return await interaction.reply({ embeds: [Embeds.DISABLED_EMBED.toJSON()] });
            if (subcommand) {
               if (
                  !(await server.testPermission(
                     subcommand.info.permission,
                     interactionData.data.member,
                     subcommand.info.allowedDefault || false,
                  ))
               ) {
                  const noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
                  noPermissionEmbed.title = '⛔ No Permission!';
                  noPermissionEmbed.description = `You do not have permission to use this subcommand. (Missing permission: \`${subcommand.info.permission}\`)`;
                  return await interaction.reply({
                     embeds: [noPermissionEmbed],
                  });
               }
               return await subcommand.execute(interactionData);
            }
         }
         if (settings.disabled_modules.find((item) => item == command.info.module.name))
            return await interaction.reply({ embeds: [Embeds.DISABLED_EMBED.toJSON()] });
         if (
            !(await server.testPermission(
               command.info.permission,
               interactionData.data.member,
               command.info.allowedDefault || false,
            ))
         ) {
            const noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
            noPermissionEmbed.title = '⛔ No Permission!';
            noPermissionEmbed.description = `You do not have permission to use this command. (Missing permission: \`${command.info.permission}\`)`;
            return await interaction.reply({
               embeds: [noPermissionEmbed],
            });
         }
         return await command.execute(interactionData);
      } else {
         const interactionData: AuxdibotCommandInteraction<DMAuxdibotCommandData> = interaction;
         interactionData.data = <DMAuxdibotCommandData>{
            dmCommand: true,
            date: new Date(),
            user: interaction.user,
         };
         if (!command.info.dmableCommand) {
            const discordServerOnlyEmbed = Embeds.DENIED_EMBED.toJSON();
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
                  const discordServerOnlyEmbed = Embeds.DENIED_EMBED.toJSON();
                  discordServerOnlyEmbed.title = '⛔ Nope!';
                  discordServerOnlyEmbed.description = `This command can only be used in Discord Servers!`;
                  return await interaction.reply({
                     embeds: [discordServerOnlyEmbed],
                  });
               }
               return await subcommand.execute(interactionData);
            }
         }

         return await command.execute(interactionData);
      }
   },
};
