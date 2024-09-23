import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setSendModerator from '@/modules/features/moderation/setSendModerator';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const moderationSendModerator = <AuxdibotSubcommand>{
   name: 'send_moderator',
   group: 'settings',
   info: {
      module: Modules['Moderation'],
      description: 'Change whether users are sent the name of the moderator that punished them.',
      usageExample: '/moderation settings send_moderator (send)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const send = interaction.options.getBoolean('send', true);
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '⚙️ Punishment Message Change';
      if (send == server.punishment_send_moderator) {
         embed.description = `Nothing changed. ${
            send
               ? 'The name of the moderator will continue to be sent with the punishment.'
               : 'The name of the moderator will continue to not be sent with the punishment.'
         }`;
         return await auxdibot.createReply(interaction, {
            embeds: [embed],
         });
      }
      return await setSendModerator(auxdibot, interaction.guild, interaction.user, send)
         .then(async () => {
            embed.description = `The punishment message for this server has been changed. ${
               send
                  ? 'The name of the moderator will be sent with the punishment.'
                  : 'The name of the moderator will not be sent with the punishment.'
            }`;
            return await auxdibot.createReply(interaction, {
               embeds: [embed],
            });
         })
         .catch(() => {
            handleError(
               auxdibot,
               'ERROR_SET_SEND_MODERATOR',
               "Couldn't set that setting. Try again later.",
               interaction,
            );
         });
   },
};
