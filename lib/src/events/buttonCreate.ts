import { GuildMember, MessageComponentInteraction } from 'discord.js';
import { IAuxdibot } from '../util/templates/IAuxdibot';
import Embeds from '../util/constants/Embeds';
import Server from '../mongo/model/server/Server';

module.exports = {
   name: 'interactionCreate',
   once: false,
   async execute(interaction: MessageComponentInteraction) {
      if (!interaction.isButton() || !interaction.guild || !interaction.member) return;
      const client: IAuxdibot = interaction.client;
      const server = await Server.findOrCreateServer(interaction.guild.id);
      if (client.buttons) {
         const button = client.buttons.get(interaction.customId.split('-')[0]);
         if (button) {
            if (button.permission) {
               if (
                  !server.testPermission(
                     button.permission,
                     interaction.member as GuildMember,
                     button.allowedDefault || false,
                  )
               ) {
                  const noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
                  noPermissionEmbed.title = '⛔ No Permission!';
                  noPermissionEmbed.description = `You do not have permission to use this button. (Missing permission: \`${button.permission}\`)`;
                  return await interaction.reply({
                     embeds: [noPermissionEmbed],
                  });
               }
            }
            await button.execute(interaction);
         }
      }
   },
};
