import { ButtonInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import Server from '@/mongo/model/server/Server';

export default async function buttonCreate(interaction: ButtonInteraction) {
   if (!interaction.guild || !interaction.member) return;
   const auxdibot = interaction.client as Auxdibot;
   const server = await Server.findOrCreateServer(interaction.guild.id);
   const settings = await server.fetchSettings();
   if (auxdibot.buttons) {
      const button = auxdibot.buttons.get(interaction.customId.split('-')[0]);
      if (button) {
         if (settings.disabled_modules.find((item) => item == button.module.name))
            return await interaction.reply({ embeds: [auxdibot.embeds.disabled.toJSON()] });

         if (button.permission) {
            if (
               !server.testPermission(
                  button.permission,
                  interaction.member as GuildMember,
                  button.allowedDefault || false,
               )
            ) {
               const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
               noPermissionEmbed.title = '⛔ No Permission!';
               noPermissionEmbed.description = `You do not have permission to use this button. (Missing permission: \`${button.permission}\`)`;
               return await interaction.reply({
                  embeds: [noPermissionEmbed],
               });
            }
         }
         await button.execute(auxdibot, interaction);
      }
   }
}
