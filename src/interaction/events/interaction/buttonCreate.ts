import { ButtonInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { testLegacyPermission } from '@/util/testPermission';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

export default async function buttonCreate(auxdibot: Auxdibot, interaction: ButtonInteraction) {
   const server = interaction.guild ? await findOrCreateServer(auxdibot, interaction.guild.id) : undefined;
   if (auxdibot.buttons) {
      const button = auxdibot.buttons.get(interaction.customId.split('-')[0]);
      if (button) {
         if (server?.disabled_modules.find((item) => item == button.module.name))
            return await auxdibot.createReply(interaction, { embeds: [auxdibot.embeds.disabled.toJSON()] });

         if (
            button.permission &&
            interaction.guild &&
            interaction.member &&
            !(await testLegacyPermission(
               auxdibot,
               interaction.guild.id,
               button.permission,
               interaction.member as GuildMember,
               button.allowedDefault || false,
            ))
         ) {
            const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
            noPermissionEmbed.title = '⛔ No Permission!';
            noPermissionEmbed.description = `You do not have permission to use this button. (Missing permission: \`${button.permission}\`)`;
            return await auxdibot.createReply(interaction, {
               embeds: [noPermissionEmbed],
            });
         }
         await button.execute(auxdibot, interaction);
      }
   }
}
