import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { Auxdibot } from '@/Auxdibot';
import { testCommandPermission } from '@/util/testCommandPermission';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

export default async function buttonCreate(auxdibot: Auxdibot, interaction: ButtonInteraction) {
   const server = interaction.guild ? await findOrCreateServer(auxdibot, interaction.guild.id) : undefined;
   if (auxdibot.buttons) {
      const button = auxdibot.buttons.get(interaction.customId.split('-')[0]);
      if (button) {
         if (server?.disabled_modules.find((item) => item == button.module.name))
            return await auxdibot.createReply(interaction, { embeds: [auxdibot.embeds.disabled.toJSON()] });
         const splitCommand = button?.command?.split(' ');
         if (button.command && interaction.guildId) {
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

         await button.execute(auxdibot, interaction);
      }
   }
}
