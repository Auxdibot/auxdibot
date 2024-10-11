import { EmbedBuilder, ContextMenuCommandInteraction } from 'discord.js';
import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { testCommandPermission } from '@/util/testCommandPermission';
import handleError from '@/util/handleError';

export default async function contextCreate(auxdibot: Auxdibot, interaction: ContextMenuCommandInteraction) {
   if (!auxdibot.context_menus) return;
   const command = auxdibot.context_menus.get(interaction.commandName);
   if (!command) return;
   auxdibot.database.analytics
      .upsert({
         where: { botID: auxdibot.user.id },
         create: { botID: auxdibot.user.id },
         update: { commands: { increment: 1 } },
      })
      .catch(() => undefined);
   if (!interaction.guild && !command.info.dmableCommand) {
      const discordServerOnlyEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
      discordServerOnlyEmbed.title = '⛔ Nope!';
      discordServerOnlyEmbed.description = `This command can only be used in Discord Servers!`;
      return await auxdibot.createReply(interaction, {
         embeds: [discordServerOnlyEmbed],
      });
   }
   const server = interaction.guild && (await findOrCreateServer(auxdibot, interaction.guild.id));

   if (server && server.disabled_modules.find((item) => item == command.info.module.name))
      return await auxdibot.createReply(interaction, { embeds: [auxdibot.embeds.disabled.toJSON()] });
   if (!command || !command.execute)
      return handleError(
         auxdibot,
         'INVALID_COMMAND_OR_SUBCOMMAND',
         'This command is incomplete! Please report this to our support server.',
         interaction,
      );

   if (interaction.guild) {
      if (command.command && interaction.guildId) {
         const permissionTest = await testCommandPermission(
            auxdibot,
            interaction,
            interaction.guildId,
            command.command.split(' ')[0],
            command.command.split(' ').slice(1),
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
   }
   try {
      await command.execute(auxdibot, interaction);
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
