import { EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { testCommandPermission } from '@/util/testPermission';

export default async function modalSubmit(auxdibot: Auxdibot, interaction: ModalSubmitInteraction) {
   const server = interaction.guild ? await findOrCreateServer(auxdibot, interaction.guild.id) : undefined;
   if (auxdibot.modals) {
      const modal = auxdibot.modals.get(interaction.customId.split('-')[0]);
      if (modal) {
         if (server?.disabled_modules.find((item) => item == modal.module.name))
            return await auxdibot.createReply(interaction, { embeds: [auxdibot.embeds.disabled.toJSON()] });
         const splitCommand = modal?.command?.split(' ');
         if (modal.command) {
            const permissionTest = await testCommandPermission(
               auxdibot,
               interaction,
               interaction.guildId,
               splitCommand[0],
               splitCommand[1] ? splitCommand.slice(1) : [],
            );
            if (permissionTest !== true) {
               const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
               noPermissionEmbed.title = '⛔ Access Denied';
               noPermissionEmbed.description =
                  permissionTest == 'noperm'
                     ? `You do not have permission to use this command.`
                     : permissionTest == 'notfound'
                     ? `This command is not found.`
                     : permissionTest == 'disabled'
                     ? `This command is disabled.`
                     : `This command is not available in this server.`;
               return await auxdibot.createReply(interaction, {
                  embeds: [noPermissionEmbed],
                  ephemeral: true,
               });
            }
         }
         await modal.execute(auxdibot, interaction);
      }
   }
}
