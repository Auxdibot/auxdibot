import { AnySelectMenuInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { testLegacyPermission } from '@/util/testPermission';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

export default async function selectMenuCreate(auxdibot: Auxdibot, interaction: AnySelectMenuInteraction) {
   const server = interaction.guild ? await findOrCreateServer(auxdibot, interaction.guild.id) : undefined;
   if (auxdibot.select_menus) {
      const select_menu = auxdibot.select_menus.get(interaction.customId.split('-')[0]);
      if (select_menu) {
         if (server?.disabled_modules.find((item) => item == select_menu.module.name))
            return await interaction.reply({ embeds: [auxdibot.embeds.disabled.toJSON()] });

         if (
            select_menu.permission &&
            interaction.guild &&
            interaction.member &&
            !(await testLegacyPermission(
               auxdibot,
               interaction.guild.id,
               select_menu.permission,
               interaction.member as GuildMember,
               select_menu.allowedDefault || false,
            ))
         ) {
            const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
            noPermissionEmbed.title = '⛔ No Permission!';
            noPermissionEmbed.description = `You do not have permission to use this select menu. (Missing permission: \`${select_menu.permission}\`)`;
            return await interaction.reply({
               embeds: [noPermissionEmbed],
            });
         }
         await select_menu.execute(auxdibot, interaction);
      }
   }
}
