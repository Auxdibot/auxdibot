import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const moderationSendReason = <AuxdibotSubcommand>{
   name: 'send_reason',
   group: 'settings',
   info: {
      module: Modules['Moderation'],
      description: 'Change whether users are sent the reason for their punishment.',
      usageExample: '/moderation settings send_reason (send)',
      permission: 'moderation.settings.send_reason',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const send = interaction.options.getBoolean('send', true);
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '⚙️ Punishment Message Change';
      if (send == server.punishment_send_reason) {
         embed.description = `Nothing changed. ${
            send
               ? 'The reason will continue to be sent with the punishment.'
               : 'The reason will continue to not be sent with the punishment.'
         }`;
         return await interaction.reply({
            embeds: [embed],
         });
      }
      return await auxdibot.database.servers
         .update({ where: { serverID: server.serverID }, data: { punishment_send_reason: send } })
         .then(async () => {
            embed.description = `The punishment message for this server has been changed. ${
               send
                  ? 'The reason will be sent with the punishment.'
                  : 'The reason will not be sent with the punishment.'
            }`;
            return await interaction.reply({
               embeds: [embed],
            });
         })
         .catch(() => {
            handleError(auxdibot, 'ERROR_SET_SEND_REASON', "Couldn't set that setting. Try again later.", interaction);
         });
   },
};
