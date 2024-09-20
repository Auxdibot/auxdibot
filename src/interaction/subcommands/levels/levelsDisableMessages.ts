import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from 'discord.js';

export default <AuxdibotSubcommand>{
   name: 'disable_messages',
   info: {
      module: Modules['Levels'],
      usageExample: '/levels disable_messages (disabled)',
      allowedDefault: true,
      dmableCommand: true,
      description: 'Disable levelup messages sent by Auxdibot to you.',
   },
   async execute(auxdibot, interaction) {
      const disabled = interaction.options.getBoolean('disabled', true);
      if (!interaction.guild) {
         await auxdibot.database.servermembers.updateMany({
            where: { userID: interaction.user.id },
            data: { level_message_disabled: disabled },
         });

         const success = new EmbedBuilder()
            .setTitle('Disabled Levelup Messages')
            .setColor(auxdibot.colors.accept)
            .setDescription(
               `Levelup messages have been ${
                  disabled ? 'disabled' : 'enabled'
               } in all of your current servers with Auxdibot added.`,
            );
         return auxdibot.createReply(interaction, {
            embeds: [success.toJSON()],
         });
      } else {
         await auxdibot.database.servermembers
            .upsert({
               where: { serverID_userID: { serverID: interaction.guild.id, userID: interaction.user.id } },
               update: { level_message_disabled: disabled },
               create: {
                  userID: interaction.user.id,
                  serverID: interaction.guild.id,
                  level_message_disabled: disabled,
               },
            })
            .catch(() => undefined);

         const success = new EmbedBuilder()
            .setTitle('Disabled Levelup Messages')
            .setColor(auxdibot.colors.accept)
            .setDescription(`Levelup messages for you have been ${disabled ? 'disabled' : 'enabled'} in this server.`);
         return auxdibot.createReply(interaction, {
            embeds: [success.toJSON()],
         });
      }
   },
};
