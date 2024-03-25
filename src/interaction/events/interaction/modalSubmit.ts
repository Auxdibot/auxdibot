import { EmbedBuilder, GuildMember, ModalSubmitInteraction } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { testLegacyPermission } from '@/util/testPermission';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

export default async function modalSubmit(auxdibot: Auxdibot, interaction: ModalSubmitInteraction) {
   const server = interaction.guild ? await findOrCreateServer(auxdibot, interaction.guild.id) : undefined;
   if (auxdibot.modals) {
      const modal = auxdibot.modals.get(interaction.customId.split('-')[0]);
      if (modal) {
         if (server?.disabled_modules.find((item) => item == modal.module.name))
            return await auxdibot.createReply(interaction, { embeds: [auxdibot.embeds.disabled.toJSON()] });

         if (
            modal.permission &&
            interaction.guild &&
            interaction.member &&
            !(await testLegacyPermission(
               auxdibot,
               interaction.guild.id,
               modal.permission,
               interaction.member as GuildMember,
               modal.allowedDefault || false,
            ))
         ) {
            const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
            noPermissionEmbed.title = '⛔ No Permission!';
            noPermissionEmbed.description = `You do not have permission to use this button. (Missing permission: \`${modal.permission}\`)`;
            return await auxdibot.createReply(interaction, {
               embeds: [noPermissionEmbed],
            });
         }
         await modal.execute(auxdibot, interaction);
      }
   }
}
